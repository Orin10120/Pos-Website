<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Product;
use App\Models\Province;
use App\Models\StockOpname;
use App\Models\StockProduct;
use App\Models\StockTotal;
use App\Models\Store;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use DOMDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Permission;
use SplFileInfo;
use Tests\TestCase;
use ZipArchive;

class StockOpnameExportTest extends TestCase
{
    use RefreshDatabase;

    private const string EXPORT_PERMISSION = 'stock-opnames.show';

    private const string EXPORT_URL = '/admin/stock-opnames/%d/export';

    private const string XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => self::EXPORT_PERMISSION, 'guard_name' => 'web']);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $stockOpname = $this->createStockOpname();

        $this->get($this->exportUrl($stockOpname))->assertRedirect('/login');
    }

    public function test_user_without_permission_cannot_export(): void
    {
        $stockOpname = $this->createStockOpname();

        $this->actingAs(User::factory()->create())
            ->get($this->exportUrl($stockOpname))
            ->assertForbidden();
    }

    public function test_export_returns_valid_and_complete_xlsx_file(): void
    {
        $stockOpname = $this->createStockOpname();

        $response = $this->actingAs($this->createUserWithPermission())
            ->get($this->exportUrl($stockOpname));

        $response->assertOk();
        $response->assertHeader('content-type', self::XLSX_CONTENT_TYPE);
        $response->assertDownload(sprintf(
            'stock-opname-%d-%s.xlsx',
            $stockOpname->id,
            $stockOpname->opname_date,
        ));

        $parts = $this->openWorkbook($response);

        $this->assertArrayHasKey('[Content_Types].xml', $parts);
        $this->assertArrayHasKey('_rels/.rels', $parts);
        $this->assertArrayHasKey('xl/workbook.xml', $parts);
        $this->assertArrayHasKey('xl/styles.xml', $parts);
        $this->assertArrayHasKey('xl/worksheets/sheet1.xml', $parts);

        $sheet = $parts['xl/worksheets/sheet1.xml'];

        $this->assertStringContainsString('LAPORAN STOCK OPNAME', $sheet);
        $this->assertStringContainsString('Informasi Stock Opname', $sheet);
        $this->assertStringContainsString('Toko Maju Jaya', $sheet);
        $this->assertStringContainsString($stockOpname->opname_date, $sheet);
        $this->assertStringContainsString('Daftar Gudang', $sheet);
        $this->assertStringContainsString('Gudang Utama', $sheet);
        $this->assertStringContainsString('Jl. Gudang No. 1', $sheet);
        $this->assertStringContainsString('Detail Produk', $sheet);
        $this->assertStringContainsString('Kopi Arabika', $sheet);
        $this->assertStringContainsString('Kuantitas Fisik', $sheet);
        $this->assertStringContainsString('Selisih', $sheet);
        $this->assertStringContainsString('TOTAL (1 produk)', $sheet);

        $this->assertStringContainsString('<mergeCell ref="A1:I1"/>', $sheet);
        $this->assertStringContainsString('<autoFilter ref="A', $sheet);
    }

    public function test_export_of_stock_opname_without_products_is_still_valid(): void
    {
        $stockOpname = $this->createStockOpname(withProducts: false);

        $response = $this->actingAs($this->createUserWithPermission())
            ->get($this->exportUrl($stockOpname));

        $response->assertOk();

        $sheet = $this->openWorkbook($response)['xl/worksheets/sheet1.xml'];

        $this->assertStringContainsString('Tidak ada data produk', $sheet);
        $this->assertStringContainsString('Tidak ada data gudang', $sheet);
        $this->assertStringNotContainsString('<autoFilter', $sheet);
    }

    public function test_detail_page_and_export_report_the_same_numbers(): void
    {
        $stockOpname = $this->createStockOpname();
        $user = $this->createUserWithPermission();

        $this->actingAs($user)
            ->get('/admin/stock-opnames/'.$stockOpname->id)
            ->assertOk()
            // Pengecekan file dilewati karena halaman project berada di resources/js/Pages,
            // sedangkan finder bawaan Inertia mencari di resources/js/pages.
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/StockOpnames/Show', shouldExist: false)
                ->where('storeProducts.0.product.name', 'Kopi Arabika')
                ->where('storeProducts.0.stock_quantity', 100)
                ->where('storeProducts.0.ending_quantity', 100)
                ->where('storeProducts.0.physical_quantity', 95)
                ->where('storeProducts.0.quantity_difference', -5));

        $response = $this->actingAs($user)->get($this->exportUrl($stockOpname));
        $response->assertOk();

        $productRow = $this->rowContaining(
            $this->openWorkbook($response)['xl/worksheets/sheet1.xml'],
            'Kopi Arabika',
        );

        $this->assertStringContainsString('<v>100</v>', $productRow, 'Stok awal pada Excel tidak sama dengan halaman detail.');
        $this->assertStringContainsString('<v>95</v>', $productRow, 'Kuantitas fisik pada Excel tidak sama dengan halaman detail.');
        $this->assertStringContainsString('<v>-5</v>', $productRow, 'Selisih pada Excel tidak sama dengan halaman detail.');
    }

    private function exportUrl(StockOpname $stockOpname): string
    {
        return sprintf(self::EXPORT_URL, $stockOpname->id);
    }

    private function createUserWithPermission(): User
    {
        $user = User::factory()->create();
        $user->givePermissionTo(self::EXPORT_PERMISSION);

        return $user;
    }

    private function createStockOpname(bool $withProducts = true): StockOpname
    {
        $province = Province::create([
            'uuid' => (string) Str::uuid(),
            'external_id' => 1,
            'name' => 'Jawa Barat',
        ]);

        $city = City::create([
            'uuid' => (string) Str::uuid(),
            'external_id' => 1,
            'name' => 'Bandung',
            'province_id' => $province->id,
        ]);

        $store = Store::create([
            'name' => 'Toko Maju Jaya',
            'address' => 'Jl. Merdeka No. 1',
            'province_id' => $province->id,
            'city_id' => $city->id,
        ]);

        $stockOpname = StockOpname::create([
            'store_id' => $store->id,
            'opname_date' => '2026-11-11',
            'status' => 'pending',
        ]);

        if (! $withProducts) {
            return $stockOpname;
        }

        $warehouse = Warehouse::create([
            'name' => 'Gudang Utama',
            'address' => 'Jl. Gudang No. 1',
            'province_id' => $province->id,
            'city_id' => $city->id,
        ]);

        $store->warehouses()->attach($warehouse->id);

        $category = Category::create(['name' => 'Minuman']);
        $unit = Unit::create(['name' => 'PCS']);

        $product = Product::create([
            'store_id' => $store->id,
            'image' => 'kopi.png',
            'barcode' => '8991234567890',
            'name' => 'Kopi Arabika',
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'selling_price' => 25000,
            'purchase_price' => 15000,
        ]);

        $stockTotal = StockTotal::create([
            'product_id' => $product->id,
            'total_stock' => 100,
        ]);

        StockProduct::create([
            'product_id' => $product->id,
            'store_id' => $store->id,
            'warehouse_id' => $warehouse->id,
            'stock_quantity' => 100,
        ]);

        $stockOpname->details()->create([
            'product_id' => $product->id,
            'stock_total_id' => $stockTotal->id,
            'physical_quantity' => 95,
            'quantity_difference' => -5,
        ]);

        return $stockOpname;
    }

    /**
     * Ambil isi satu baris pada sheet XML yang mengandung teks tertentu.
     */
    private function rowContaining(string $sheetXml, string $needle): string
    {
        $rows = preg_split('/<\/row>/', $sheetXml) ?: [];

        foreach ($rows as $row) {
            if (str_contains($row, $needle)) {
                return $row;
            }
        }

        $this->fail("Tidak ada baris pada file Excel yang berisi: {$needle}");
    }

    /**
     * Buka file hasil export, kembalikan isi tiap bagian file, sekaligus
     * memastikan seluruh bagian XML-nya valid.
     *
     * @return array<string, string>
     */
    private function openWorkbook(TestResponse $response): array
    {
        $file = $response->baseResponse->getFile();

        $this->assertInstanceOf(SplFileInfo::class, $file);

        $zip = new ZipArchive;
        $opened = $zip->open($file->getPathname());

        $this->assertTrue($opened === true, 'File hasil export bukan file XLSX yang valid.');

        $parts = [];

        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = $zip->getNameIndex($index);
            $parts[$name] = $zip->getFromIndex($index) ?: '';
        }

        $zip->close();

        foreach ($parts as $name => $content) {
            if (str_ends_with($name, '.xml') || str_ends_with($name, '.rels')) {
                $this->assertTrue($this->isValidXml($content), "Bagian file {$name} bukan XML yang valid.");
            }
        }

        return $parts;
    }

    private function isValidXml(string $xml): bool
    {
        $useInternalErrors = libxml_use_internal_errors(true);
        $document = new DOMDocument;
        $valid = $document->loadXML($xml);
        libxml_clear_errors();
        libxml_use_internal_errors($useInternalErrors);

        return $valid !== false;
    }
}
