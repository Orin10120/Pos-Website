<?php

namespace App\Services;

/**
 * Definisi style sel untuk file XLSX.
 *
 * Urutan definisi menentukan indeks style (cellXfs) pada file styles.xml,
 * sehingga XlsxWriter cukup membaca method definitions() untuk menulis style.
 */
final class XlsxStyle
{
    public const string Default = 'default';

    public const string Title = 'title';

    public const string Section = 'section';

    public const string MetaLabel = 'metaLabel';

    public const string MetaValue = 'metaValue';

    public const string MetaNumber = 'metaNumber';

    public const string MetaNumberDanger = 'metaNumberDanger';

    public const string Header = 'header';

    public const string Body = 'body';

    public const string BodyCenter = 'bodyCenter';

    public const string BodyDanger = 'bodyDanger';

    public const string TotalLabel = 'totalLabel';

    public const string TotalNumber = 'totalNumber';

    public const string TotalNumberDanger = 'totalNumberDanger';

    /**
     * Definisi style berdasarkan nama style.
     *
     * @return array<string, array{
     *     font?: array{name?: string, size?: float, bold?: bool, italic?: bool, color?: string},
     *     fill?: string|null,
     *     border?: bool,
     *     alignment?: array{horizontal?: string, vertical?: string, wrapText?: bool, indent?: int}
     * }>
     */
    public static function definitions(): array
    {
        return [
            self::Default => [],
            self::Title => [
                'font' => ['size' => 16, 'bold' => true, 'color' => '1F3864'],
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
            ],
            self::Section => [
                'font' => ['bold' => true, 'color' => 'FFFFFF'],
                'fill' => '2F5597',
                'alignment' => ['horizontal' => 'left', 'vertical' => 'center', 'indent' => 1],
            ],
            self::MetaLabel => [
                'font' => ['bold' => true, 'color' => '1F3864'],
                'fill' => 'DDEBF7',
                'border' => true,
                'alignment' => ['horizontal' => 'left', 'vertical' => 'center', 'indent' => 1],
            ],
            self::MetaValue => [
                'border' => true,
                'alignment' => ['horizontal' => 'left', 'vertical' => 'center', 'indent' => 1],
            ],
            self::MetaNumber => [
                'border' => true,
                'alignment' => ['horizontal' => 'right', 'vertical' => 'center'],
            ],
            self::MetaNumberDanger => [
                'font' => ['bold' => true, 'color' => 'C00000'],
                'border' => true,
                'alignment' => ['horizontal' => 'right', 'vertical' => 'center'],
            ],
            self::Header => [
                'font' => ['bold' => true, 'color' => 'FFFFFF'],
                'fill' => '2F5597',
                'border' => true,
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center', 'wrapText' => true],
            ],
            self::Body => [
                'border' => true,
                'alignment' => ['vertical' => 'center', 'wrapText' => true],
            ],
            self::BodyCenter => [
                'border' => true,
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
            ],
            self::BodyDanger => [
                'font' => ['color' => 'C00000'],
                'border' => true,
                'alignment' => ['vertical' => 'center'],
            ],
            self::TotalLabel => [
                'font' => ['bold' => true, 'color' => '1F3864'],
                'fill' => 'DDEBF7',
                'border' => true,
                'alignment' => ['horizontal' => 'left', 'vertical' => 'center', 'indent' => 1],
            ],
            self::TotalNumber => [
                'font' => ['bold' => true],
                'fill' => 'DDEBF7',
                'border' => true,
                'alignment' => ['horizontal' => 'right', 'vertical' => 'center'],
            ],
            self::TotalNumberDanger => [
                'font' => ['bold' => true, 'color' => 'C00000'],
                'fill' => 'DDEBF7',
                'border' => true,
                'alignment' => ['horizontal' => 'right', 'vertical' => 'center'],
            ],
        ];
    }
}
