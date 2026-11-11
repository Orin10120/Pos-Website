<?php

namespace App\Services;

use App\Models\StockOpname;
use App\Models\StockProduct;
use Illuminate\Support\Collection;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Export detail stock opname menjadi file Excel (.xlsx) yang rapi.
 */
final class StockOpnameExcelExporter
{
    private const int COLUMN_COUNT = 9;

    private const string CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    public function __construct(private StockOpnameReportBuilder $reportBuilder) {}

    /**
     * Bangun workbook lalu kirim sebagai file unduhan .xlsx.
     *
     * @throws RuntimeException
     */
    public function download(StockOpname $stockOpname): BinaryFileResponse
    {
        $path = tempnam(sys_get_temp_dir(), 'stock-opname-');

        if ($path === false) {
            throw new RuntimeException('Gagal membuat file sementara untuk export Excel.');
        }

        $this->build($stockOpname)->save($path);

        return response()->download($path, $this->filename($stockOpname), [
            'Content-Type' => self::CONTENT_TYPE,
        ])->deleteFileAfterSend(true);
    }

    private function build(StockOpname $stockOpname): XlsxWriter
    {
        $report = $this->reportBuilder->build($stockOpname);

        $storeName = $report['storeNames']->first()?->name ?? 'Toko Tidak Diketahui';
        $totalStoreStock = (int) $report['storeStockQuantities']->sum('total_stock');
        $products = $report['products'];

        $writer = new XlsxWriter('Stock Opname');
        $writer->setColumnWidths([6, 36, 18, 12, 12, 12, 12, 14, 10]);

        $writer->addRow([
            new XlsxCell('LAPORAN STOCK OPNAME', XlsxStyle::Title, self::COLUMN_COUNT),
        ], height: 30);

        $writer->addRow([], height: 6);

        $writer->addRow([
            new XlsxCell('Informasi Stock Opname', XlsxStyle::Section, self::COLUMN_COUNT),
        ], height: 20);

        $this->addMetaRow($writer, 'Toko', $storeName);
        $this->addMetaRow($writer, 'Tanggal Opname', (string) $stockOpname->opname_date);
        $this->addMetaRow($writer, 'Status', ucfirst((string) $stockOpname->status));
        $this->addMetaRow($writer, 'Total Stok Toko', $totalStoreStock, XlsxStyle::MetaNumber);
        $this->addMetaRow($writer, 'Dicetak Pada', now()->format('d/m/Y H:i'));

        $writer->addRow([], height: 6);

        $writer->addRow([
            new XlsxCell('Daftar Gudang', XlsxStyle::Section, self::COLUMN_COUNT),
        ], height: 20);

        $writer->addRow([
            new XlsxCell('Nama Gudang', XlsxStyle::Header, 2),
            new XlsxCell('Alamat Gudang', XlsxStyle::Header, 7),
        ], height: 24);

        if ($report['warehouses']->isEmpty()) {
            $writer->addRow([
                new XlsxCell('Tidak ada data gudang', XlsxStyle::Body, self::COLUMN_COUNT),
            ]);
        } else {
            foreach ($report['warehouses'] as $warehouse) {
                $writer->addRow([
                    new XlsxCell($warehouse->name, XlsxStyle::Body, 2),
                    new XlsxCell($warehouse->address, XlsxStyle::Body, 7),
                ]);
            }
        }

        $writer->addRow([], height: 6);

        $writer->addRow([
            new XlsxCell('Detail Produk', XlsxStyle::Section, self::COLUMN_COUNT),
        ], height: 20);

        $this->addProductTable($writer, $products);

        return $writer;
    }

    /**
     * @param  Collection<int, StockProduct>  $products
     */
    private function addProductTable(XlsxWriter $writer, Collection $products): void
    {
        $headerRow = $writer->addRow([
            'No',
            'Nama Produk',
            'Barcode',
            'Satuan',
            'Stok Awal',
            'Penjualan',
            'Stok Akhir',
            'Kuantitas Fisik',
            'Selisih',
        ], XlsxStyle::Header, 30);

        if ($products->isEmpty()) {
            $writer->addRow([
                new XlsxCell('Tidak ada data produk', XlsxStyle::Body, self::COLUMN_COUNT),
            ]);

            return;
        }

        $lastDataRow = $headerRow;

        foreach ($products as $index => $product) {
            $difference = (int) $product->quantity_difference;

            $lastDataRow = $writer->addRow([
                new XlsxCell($index + 1, XlsxStyle::BodyCenter),
                $product->product?->name ?? '-',
                $product->product?->barcode ?? '-',
                $product->product?->unit?->name ?? '-',
                (int) $product->stock_quantity,
                (int) $product->sales_quantity,
                (int) $product->ending_quantity,
                (int) $product->physical_quantity,
                new XlsxCell($difference, $difference < 0 ? XlsxStyle::BodyDanger : XlsxStyle::Body),
            ], XlsxStyle::Body);
        }

        $writer->setAutoFilter(sprintf(
            'A%d:%s%d',
            $headerRow,
            XlsxWriter::columnName(self::COLUMN_COUNT),
            $lastDataRow,
        ));

        $totalDifference = (int) $products->sum('quantity_difference');

        $writer->addRow([
            new XlsxCell(
                sprintf('TOTAL (%d produk)', $products->count()),
                XlsxStyle::TotalLabel,
                4,
            ),
            new XlsxCell((int) $products->sum('stock_quantity'), XlsxStyle::TotalNumber),
            new XlsxCell((int) $products->sum('sales_quantity'), XlsxStyle::TotalNumber),
            new XlsxCell((int) $products->sum('ending_quantity'), XlsxStyle::TotalNumber),
            new XlsxCell((int) $products->sum('physical_quantity'), XlsxStyle::TotalNumber),
            new XlsxCell(
                $totalDifference,
                $totalDifference < 0 ? XlsxStyle::TotalNumberDanger : XlsxStyle::TotalNumber,
            ),
        ], XlsxStyle::TotalNumber, 22);
    }

    private function addMetaRow(XlsxWriter $writer, string $label, mixed $value, string $valueStyle = XlsxStyle::MetaValue): void
    {
        $writer->addRow([
            new XlsxCell($label, XlsxStyle::MetaLabel, 2),
            new XlsxCell($value, $valueStyle, 7),
        ]);
    }

    private function filename(StockOpname $stockOpname): string
    {
        $date = preg_replace('/[^0-9\-]/', '-', (string) $stockOpname->opname_date) ?: 'tanpa-tanggal';

        return sprintf('stock-opname-%d-%s.xlsx', $stockOpname->id, $date);
    }
}
