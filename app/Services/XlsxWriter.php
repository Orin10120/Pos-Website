<?php

namespace App\Services;

use RuntimeException;
use XMLWriter;
use ZipArchive;

/**
 * Penulis file XLSX (Office Open XML) tanpa dependency eksternal.
 *
 * Mendukung beberapa baris, style per sel, merge sel, lebar kolom,
 * tinggi baris, dan auto filter agar hasil export rapi saat dibuka di Excel.
 */
final class XlsxWriter
{
    private const string MAIN_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

    private const string REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

    private const string PACKAGE_REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';

    private const string CONTENT_TYPES_NS = 'http://schemas.openxmlformats.org/package/2006/content-types';

    private const string CORE_PROPS_NS = 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties';

    private const string DUBLIN_CORE_NS = 'http://purl.org/dc/elements/1.1/';

    private const string DUBLIN_TERMS_NS = 'http://purl.org/dc/terms/';

    private const string XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance';

    private const string APP_PROPS_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties';

    private const string VT_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes';

    private const string CONTENT_TYPE_WORKBOOK = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml';

    private const string CONTENT_TYPE_WORKSHEET = 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml';

    private const string CONTENT_TYPE_STYLES = 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml';

    private const string CONTENT_TYPE_CORE_PROPS = 'application/vnd.openxmlformats-package.core-properties+xml';

    private const string CONTENT_TYPE_APP_PROPS = 'application/vnd.openxmlformats-officedocument.extended-properties+xml';

    /** @var list<array{cells: list<array{value: mixed, style: string}>, height: float|null}> */
    private array $rows = [];

    /** @var list<string> */
    private array $merges = [];

    /** @var list<float> Lebar kolom, index 0 = kolom A. */
    private array $columnWidths = [];

    private ?string $autoFilterRange = null;

    private string $sheetName;

    public function __construct(string $sheetName = 'Sheet1')
    {
        $this->sheetName = self::sanitizeSheetName($sheetName);
    }

    /**
     * Atur lebar kolom, index 0 = kolom A.
     *
     * @param  list<float>  $widths
     */
    public function setColumnWidths(array $widths): void
    {
        $this->columnWidths = array_values($widths);
    }

    /**
     * Set range auto filter, contoh: "A5:I20".
     */
    public function setAutoFilter(string $range): void
    {
        $this->autoFilterRange = $range;
    }

    /**
     * Tambah satu baris baru.
     *
     * Setiap elemen $cells dapat berupa skalar (memakai $defaultStyle),
     * XlsxCell (memakai style sendiri), atau XlsxCell dengan columns > 1
     * untuk menggabungkan beberapa kolom (merge).
     *
     * @param  list<mixed>  $cells
     * @return int Nomor baris hasil tambahan (mulai dari 1)
     */
    public function addRow(array $cells, string $defaultStyle = XlsxStyle::Default, ?float $height = null): int
    {
        $rowNumber = count($this->rows) + 1;
        $columnNumber = 1;
        $expandedCells = [];

        foreach ($cells as $cell) {
            if ($cell instanceof XlsxCell) {
                $value = $cell->value;
                $style = $cell->style;
                $span = max(1, $cell->columns);
            } else {
                $value = $cell;
                $style = $defaultStyle;
                $span = 1;
            }

            for ($offset = 0; $offset < $span; $offset++) {
                $expandedCells[] = [
                    'value' => $offset === 0 ? $value : null,
                    'style' => $style,
                ];
            }

            if ($span > 1) {
                $this->merges[] = sprintf(
                    '%s%d:%s%d',
                    self::columnName($columnNumber),
                    $rowNumber,
                    self::columnName($columnNumber + $span - 1),
                    $rowNumber,
                );
            }

            $columnNumber += $span;
        }

        $this->rows[] = ['cells' => $expandedCells, 'height' => $height];

        return $rowNumber;
    }

    /**
     * Simpan workbook ke file .xlsx pada path yang ditentukan.
     *
     * @throws RuntimeException
     */
    public function save(string $path): void
    {
        $zip = new ZipArchive;

        if ($zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException("Gagal membuka file sementara untuk export Excel: {$path}");
        }

        $zip->addFromString('[Content_Types].xml', self::contentTypesXml());
        $zip->addFromString('_rels/.rels', self::packageRelationshipsXml());
        $zip->addFromString('docProps/core.xml', self::corePropertiesXml());
        $zip->addFromString('docProps/app.xml', self::appPropertiesXml($this->sheetName));
        $zip->addFromString('xl/workbook.xml', $this->workbookXml());
        $zip->addFromString('xl/_rels/workbook.xml.rels', self::workbookRelationshipsXml());
        $zip->addFromString('xl/styles.xml', self::stylesXml());
        $zip->addFromString('xl/worksheets/sheet1.xml', $this->worksheetXml());

        if (! $zip->close()) {
            throw new RuntimeException("Gagal menulis file Excel: {$path}");
        }
    }

    /**
     * Konversi nomor kolom (1-based) menjadi huruf kolom Excel, contoh: 1 -> A, 27 -> AA.
     */
    public static function columnName(int $columnNumber): string
    {
        $name = '';

        while ($columnNumber > 0) {
            $columnNumber--;
            $name = chr(65 + ($columnNumber % 26)).$name;
            $columnNumber = intdiv($columnNumber, 26);
        }

        return $name;
    }

    private static function sanitizeSheetName(string $sheetName): string
    {
        $sanitized = preg_replace('/[\\\\\/\*\?\:\[\]]/u', '-', trim($sheetName)) ?? '';
        $sanitized = mb_substr($sanitized, 0, 31);

        return $sanitized !== '' ? $sanitized : 'Sheet1';
    }

    private function worksheetXml(): string
    {
        $styleIndexes = array_flip(array_keys(XlsxStyle::definitions()));

        $maxRow = count($this->rows);
        $maxColumn = 0;

        foreach ($this->rows as $row) {
            $maxColumn = max($maxColumn, count($row['cells']));
        }

        $dimension = $maxRow > 0 && $maxColumn > 0
            ? 'A1:'.self::columnName($maxColumn).$maxRow
            : 'A1';

        $xml = self::createXmlWriter();
        $xml->startElement('worksheet');
        $xml->writeAttribute('xmlns', self::MAIN_NS);

        $xml->startElement('sheetPr');
        $xml->startElement('pageSetUpPr');
        $xml->writeAttribute('fitToPage', '1');
        $xml->endElement();
        $xml->endElement();

        $xml->startElement('dimension');
        $xml->writeAttribute('ref', $dimension);
        $xml->endElement();

        $xml->startElement('sheetViews');
        $xml->startElement('sheetView');
        $xml->writeAttribute('workbookViewId', '0');
        $xml->endElement();
        $xml->endElement();

        $xml->startElement('sheetFormatPr');
        $xml->writeAttribute('defaultRowHeight', '15');
        $xml->endElement();

        if ($this->columnWidths !== []) {
            $xml->startElement('cols');

            foreach ($this->columnWidths as $index => $width) {
                $xml->startElement('col');
                $xml->writeAttribute('min', (string) ($index + 1));
                $xml->writeAttribute('max', (string) ($index + 1));
                $xml->writeAttribute('width', (string) $width);
                $xml->writeAttribute('customWidth', '1');
                $xml->endElement();
            }

            $xml->endElement();
        }

        $xml->startElement('sheetData');

        foreach ($this->rows as $index => $row) {
            $rowNumber = $index + 1;

            $xml->startElement('row');
            $xml->writeAttribute('r', (string) $rowNumber);

            if ($row['height'] !== null) {
                $xml->writeAttribute('ht', (string) $row['height']);
                $xml->writeAttribute('customHeight', '1');
            }

            foreach ($row['cells'] as $columnIndex => $cell) {
                self::writeCell($xml, $rowNumber, $columnIndex + 1, $cell['value'], $styleIndexes[$cell['style']] ?? 0);
            }

            $xml->endElement();
        }

        $xml->endElement();

        if ($this->autoFilterRange !== null) {
            $xml->startElement('autoFilter');
            $xml->writeAttribute('ref', $this->autoFilterRange);
            $xml->endElement();
        }

        if ($this->merges !== []) {
            $xml->startElement('mergeCells');
            $xml->writeAttribute('count', (string) count($this->merges));

            foreach ($this->merges as $merge) {
                $xml->startElement('mergeCell');
                $xml->writeAttribute('ref', $merge);
                $xml->endElement();
            }

            $xml->endElement();
        }

        $xml->startElement('printOptions');
        $xml->writeAttribute('horizontalCentered', '1');
        $xml->endElement();

        $xml->startElement('pageMargins');
        $xml->writeAttribute('left', '0.5');
        $xml->writeAttribute('right', '0.5');
        $xml->writeAttribute('top', '0.6');
        $xml->writeAttribute('bottom', '0.6');
        $xml->writeAttribute('header', '0.3');
        $xml->writeAttribute('footer', '0.3');
        $xml->endElement();

        $xml->startElement('pageSetup');
        $xml->writeAttribute('paperSize', '9');
        $xml->writeAttribute('orientation', 'landscape');
        $xml->writeAttribute('fitToWidth', '1');
        $xml->writeAttribute('fitToHeight', '0');
        $xml->endElement();

        $xml->endElement();
        $xml->endDocument();

        return $xml->outputMemory();
    }

    private static function writeCell(XMLWriter $xml, int $rowNumber, int $columnNumber, mixed $value, int $styleIndex): void
    {
        $xml->startElement('c');
        $xml->writeAttribute('r', self::columnName($columnNumber).$rowNumber);
        $xml->writeAttribute('s', (string) $styleIndex);

        if (is_int($value) || is_float($value)) {
            $xml->writeElement('v', (string) $value);
        } elseif (is_bool($value)) {
            $xml->writeAttribute('t', 'b');
            $xml->writeElement('v', $value ? '1' : '0');
        } elseif ($value !== null && $value !== '') {
            $xml->writeAttribute('t', 'inlineStr');
            $xml->startElement('is');
            $xml->startElement('t');
            $xml->writeAttribute('xml:space', 'preserve');
            $xml->text(self::sanitizeUtf8((string) $value));
            $xml->endElement();
            $xml->endElement();
        }

        $xml->endElement();
    }

    private static function sanitizeUtf8(string $value): string
    {
        if (! mb_check_encoding($value, 'UTF-8')) {
            $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
        }

        return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $value) ?? '';
    }

    private static function createXmlWriter(): XMLWriter
    {
        $xml = new XMLWriter;
        $xml->openMemory();
        $xml->setIndent(true);
        $xml->setIndentString('  ');
        $xml->startDocument('1.0', 'UTF-8');

        return $xml;
    }

    private function workbookXml(): string
    {
        $escapedSheetName = htmlspecialchars($this->sheetName, ENT_XML1 | ENT_QUOTES, 'UTF-8');

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="'.self::MAIN_NS.'" xmlns:r="'.self::REL_NS.'">'
            .'<workbookPr/>'
            .'<bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="14000"/></bookViews>'
            .'<sheets><sheet name="'.$escapedSheetName.'" sheetId="1" r:id="rId1"/></sheets>'
            .'</workbook>';
    }

    private static function stylesXml(): string
    {
        $fonts = [];
        $fontIds = [];
        $fills = [];
        $fillIds = ['none' => 0, 'gray125' => 1];
        $borders = [];
        $cellXfs = [];

        $fonts[] = self::fontXml([]);
        $fontIds[self::fontKey([])] = 0;

        $fills[] = '<fill><patternFill patternType="none"/></fill>';
        $fills[] = '<fill><patternFill patternType="gray125"/></fill>';

        $borders[] = '<border><left/><right/><top/><bottom/><diagonal/></border>';
        $borders[] = '<border>'
            .'<left style="thin"><color rgb="FFB7B7B7"/></left>'
            .'<right style="thin"><color rgb="FFB7B7B7"/></right>'
            .'<top style="thin"><color rgb="FFB7B7B7"/></top>'
            .'<bottom style="thin"><color rgb="FFB7B7B7"/></bottom>'
            .'<diagonal/>'
            .'</border>';

        foreach (XlsxStyle::definitions() as $definition) {
            $font = $definition['font'] ?? [];
            $fontKey = self::fontKey($font);

            if (! isset($fontIds[$fontKey])) {
                $fontIds[$fontKey] = count($fonts);
                $fonts[] = self::fontXml($font);
            }

            $fillId = 0;
            $fillColor = $definition['fill'] ?? null;

            if ($fillColor !== null) {
                if (! isset($fillIds[$fillColor])) {
                    $fillIds[$fillColor] = count($fills);
                    $fills[] = '<fill><patternFill patternType="solid">'
                        .'<fgColor rgb="FF'.$fillColor.'"/>'
                        .'<bgColor indexed="64"/>'
                        .'</patternFill></fill>';
                }

                $fillId = $fillIds[$fillColor];
            }

            $borderId = ($definition['border'] ?? false) ? 1 : 0;
            $alignment = $definition['alignment'] ?? null;
            $isDefault = $definition === [];

            $cellXfs[] = self::xfXml($fontIds[$fontKey], $fillId, $borderId, $alignment, $isDefault);
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="'.self::MAIN_NS.'">'
            .'<fonts count="'.count($fonts).'">'.implode('', $fonts).'</fonts>'
            .'<fills count="'.count($fills).'">'.implode('', $fills).'</fills>'
            .'<borders count="'.count($borders).'">'.implode('', $borders).'</borders>'
            .'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            .'<cellXfs count="'.count($cellXfs).'">'.implode('', $cellXfs).'</cellXfs>'
            .'<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            .'<dxfs count="0"/>'
            .'<tableStyles count="0" defaultTableStyle="Medium2" defaultPivotStyle="Light16"/>'
            .'</styleSheet>';
    }

    private static function fontKey(array $font): string
    {
        ksort($font);

        return json_encode($font, JSON_THROW_ON_ERROR);
    }

    private static function fontXml(array $font): string
    {
        $xml = '<font>';

        if ($font['bold'] ?? false) {
            $xml .= '<b/>';
        }

        if ($font['italic'] ?? false) {
            $xml .= '<i/>';
        }

        $xml .= '<sz val="'.($font['size'] ?? 11).'"/>';

        if (isset($font['color'])) {
            $xml .= '<color rgb="FF'.$font['color'].'"/>';
        } else {
            $xml .= '<color theme="1"/>';
        }

        $xml .= '<name val="'.($font['name'] ?? 'Calibri').'"/>';
        $xml .= '<family val="2"/>';
        $xml .= '<scheme val="minor"/>';

        return $xml.'</font>';
    }

    private static function xfXml(int $fontId, int $fillId, int $borderId, ?array $alignment, bool $isDefault): string
    {
        $attributes = sprintf('numFmtId="0" fontId="%d" fillId="%d" borderId="%d" xfId="0"', $fontId, $fillId, $borderId);

        if ($isDefault && $alignment === null) {
            return '<xf '.$attributes.'/>';
        }

        $xml = '<xf '.$attributes.' applyFont="1" applyFill="1" applyBorder="1"';

        if ($alignment !== null) {
            $xml .= ' applyAlignment="1"><alignment'.self::alignmentXml($alignment).'/></xf>';

            return $xml;
        }

        return $xml.'/>';
    }

    private static function alignmentXml(array $alignment): string
    {
        $xml = '';

        if (isset($alignment['horizontal'])) {
            $xml .= ' horizontal="'.$alignment['horizontal'].'"';
        }

        if (isset($alignment['vertical'])) {
            $xml .= ' vertical="'.$alignment['vertical'].'"';
        }

        if ($alignment['wrapText'] ?? false) {
            $xml .= ' wrapText="1"';
        }

        if (isset($alignment['indent'])) {
            $xml .= ' indent="'.(int) $alignment['indent'].'"';
        }

        return $xml;
    }

    private static function contentTypesXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="'.self::CONTENT_TYPES_NS.'">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="'.self::CONTENT_TYPE_WORKBOOK.'"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="'.self::CONTENT_TYPE_WORKSHEET.'"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="'.self::CONTENT_TYPE_STYLES.'"/>'
            .'<Override PartName="/docProps/core.xml" ContentType="'.self::CONTENT_TYPE_CORE_PROPS.'"/>'
            .'<Override PartName="/docProps/app.xml" ContentType="'.self::CONTENT_TYPE_APP_PROPS.'"/>'
            .'</Types>';
    }

    private static function packageRelationshipsXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="'.self::PACKAGE_REL_NS.'">'
            .'<Relationship Id="rId1" Type="'.self::REL_NS.'/officeDocument" Target="xl/workbook.xml"/>'
            .'<Relationship Id="rId2" Type="'.self::PACKAGE_REL_NS.'/metadata/core-properties" Target="docProps/core.xml"/>'
            .'<Relationship Id="rId3" Type="'.self::REL_NS.'/extended-properties" Target="docProps/app.xml"/>'
            .'</Relationships>';
    }

    private static function workbookRelationshipsXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="'.self::PACKAGE_REL_NS.'">'
            .'<Relationship Id="rId1" Type="'.self::REL_NS.'/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="'.self::REL_NS.'/styles" Target="styles.xml"/>'
            .'</Relationships>';
    }

    private static function corePropertiesXml(): string
    {
        $timestamp = gmdate('Y-m-d\TH:i:s\Z');

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<cp:coreProperties xmlns:cp="'.self::CORE_PROPS_NS.'"'
            .' xmlns:dc="'.self::DUBLIN_CORE_NS.'"'
            .' xmlns:dcterms="'.self::DUBLIN_TERMS_NS.'"'
            .' xmlns:xsi="'.self::XSI_NS.'">'
            .'<dc:creator>AlphaPOS</dc:creator>'
            .'<cp:lastModifiedBy>AlphaPOS</cp:lastModifiedBy>'
            .'<dcterms:created xsi:type="dcterms:W3CDTF">'.$timestamp.'</dcterms:created>'
            .'<dcterms:modified xsi:type="dcterms:W3CDTF">'.$timestamp.'</dcterms:modified>'
            .'</cp:coreProperties>';
    }

    private static function appPropertiesXml(string $sheetName): string
    {
        $escapedSheetName = htmlspecialchars($sheetName, ENT_XML1 | ENT_QUOTES, 'UTF-8');

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Properties xmlns="'.self::APP_PROPS_NS.'" xmlns:vt="'.self::VT_NS.'">'
            .'<Application>AlphaPOS</Application>'
            .'<TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>'.$escapedSheetName.'</vt:lpstr></vt:vector></TitlesOfParts>'
            .'<HeadingPairs><vt:vector size="2" baseType="variant">'
            .'<vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant>'
            .'<vt:variant><vt:i4>1</vt:i4></vt:variant>'
            .'</vt:vector></HeadingPairs>'
            .'</Properties>';
    }
}
