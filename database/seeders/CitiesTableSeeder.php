<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Province;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class CitiesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Mengambil data kota dari API RajaOngkir...');

        $allCities = $this->fetchAllCities();

        if (empty($allCities)) {
            $this->command->error('Gagal mengambil data kota dari API RajaOngkir.');
            return;
        }

        $this->storeCities($allCities);

        $this->command->info('Tabel kota berhasil di-seed.');
    }

    private function fetchAllCities(): array
    {
        // Panggil endpoint /city tanpa parameter untuk mendapatkan seluruh kota sekaligus
        $response = Http::withHeaders([
            'key' => config('rajaongkir.api_key'), // Key header RajaOngkir menggunakan huruf kecil 'key'
            'Accept' => 'application/json',
        ])->get(config('rajaongkir.endpoints.city'));

        if ($response->failed()) {
            $this->command->error('Response Error dari API RajaOngkir: ' . $response->body());
            return [];
        }

        // Struktur JSON RajaOngkir: rajaongkir -> results
        $results = $response->json()['rajaongkir']['results'] ?? [];

        return $results;
    }

    private function storeCities(array $cities): void
    {
        $data = collect($cities)->map(function ($city) {
            return [
                'id' => $city['city_id'],
                'province_id' => $city['province_id'],
                'name' => $city['type'] . ' ' . $city['city_name'], // Contoh: "Kota Bandung" atau "Kabupaten Bandung"
            ];
        })->toArray();

        // Safe insert dengan upsert
        City::upsert($data, ['id'], ['province_id', 'name']);

        // Reset sequence PostgreSQL agar auto-increment tetap sinkron
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('cities', 'id'), COALESCE(MAX(id), 1)) FROM cities;");
        }
    }
}
