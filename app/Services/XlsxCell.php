<?php

namespace App\Services;

/**
 * Representasi satu sel pada worksheet XLSX.
 */
final class XlsxCell
{
    /**
     * @param  mixed  $value  Isi sel (string, int, float, bool, atau null untuk sel kosong berstyle)
     * @param  string  $style  Nama style dari XlsxStyle
     * @param  int  $columns  Jumlah kolom yang digabung (merge); 1 berarti tidak digabung
     */
    public function __construct(
        public readonly mixed $value,
        public readonly string $style = XlsxStyle::Default,
        public readonly int $columns = 1,
    ) {}
}
