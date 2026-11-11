<h1 align="center">POS Website</h1>

<p align="center">
  Aplikasi Point of Sale berbasis web untuk mengelola penjualan, stok, pembelian, dan laporan keuangan.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-13.x-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/PHP-8.3%2B-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Inertia.js-v3-9553E9?style=flat-square" alt="Inertia">
  <img src="https://img.shields.io/badge/Xendit-Payment-4353FF?style=flat-square" alt="Xendit">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

---

## Tentang Project

POS Website adalah aplikasi manajemen toko (Point of Sale) yang dibangun dengan **Laravel** di sisi server dan **React + Inertia.js** di sisi client, sehingga tidak memerlukan API terpisah. Aplikasi ini mencakup alur bisnis lengkap: dari master data produk, purchase order, mutasi stok, kasir (POS), pembayaran online, hingga laporan penjualan dan laba.

## Fitur

**Autentikasi & Akses**
- Login email/password dan login **Face ID / Passkey** (WebAuthn) — pendaftaran passkey dilakukan admin.
- Manajemen role & permission berbasis [spatie/laravel-permission](https://spatie.be/docs/laravel-permission).
- Data dibatasi per toko (`store`) untuk pengguna non-admin.

**Master Data**
- Produk, kategori, satuan, pelanggan, supplier, toko, gudang, provinsi & kota.

**Pembelian & Stok**
- Purchase order beserta detail item dan status.
- Kartu stok per produk/gudang, serta **stock opname** dengan **export Excel (.xlsx)**.

**Penjualan (Kasir)**
- Keranjang belanja, pencarian produk, dan pemindaian barcode.
- Integrasi **Xendit Invoice** untuk pembayaran online, dengan webhook notifikasi berbasis token.
- Cetak struk (`react-to-print`).

**Laporan & Analitik**
- Dashboard dengan grafik penjualan, produk terlaris, dan status transaksi (Recharts).
- Laporan penjualan dan laporan laba/rugi per rentang tanggal.

## Stack Teknologi

| Bagian | Teknologi |
| --- | --- |
| Backend | Laravel 13, PHP 8.3+ |
| Frontend | React 19, Inertia.js v3 |
| Styling | Bootstrap 5, Bootstrap Icons, CSS kustom |
| Database | SQLite (default), mendukung MySQL/PostgreSQL |
| Autentikasi | Laravel Session, Laravel Passkeys (WebAuthn), Sanctum |
| Pembayaran | Xendit PHP SDK v2.19 |
| Build Tool | Vite 8 |
| Testing | PHPUnit 12 |

## Kebutuhan Sistem

- PHP **8.3** atau lebih baru (dengan ekstensi `pdo_sqlite`, `mbstring`, `zip`, `curl`)
- Composer 2
- Node.js 18+ dan npm

## Instalasi

```bash
git clone https://github.com/Orin10120/Pos-Website.git
cd Pos-Website
```

Jalankan setup otomatis (install dependency, salin `.env`, generate key, migrasi, build asset):

```bash
composer setup
```

Atau secara manual:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build
```

## Konfigurasi

### Database

Konfigurasi default menggunakan **SQLite**. Untuk MySQL/PostgreSQL, ubah baris berikut di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_website
DB_USERNAME=root
DB_PASSWORD=
```

### Pembayaran Xendit

Tambahkan kredensial berikut ke `.env` untuk mengaktifkan pembayaran online:

```env
XENDIT_SECRET_KEY=your-secret-key
XENDIT_IS_PRODUCTION=false
XENDIT_TOKEN_WEBHOOK=your-callback-token
```

| Variabel | Deskripsi |
| --- | --- |
| `XENDIT_SECRET_KEY` | Secret key dari Xendit Dashboard → *Settings → Developers → API keys*. |
| `XENDIT_IS_PRODUCTION` | `false` untuk mode sandbox, `true` untuk production. |
| `XENDIT_TOKEN_WEBHOOK` | Token callback dari Xendit Dashboard → *Settings → Developers → Callbacks*. |

> Webhook diterima pada endpoint `POST /api/xendit/notification` dan divalidasi melalui header `x-callback-token`.

### Data Awal

Seeder berikut membuat role `admin`, seluruh permission, dan akun administrator:

| Field | Nilai |
| --- | --- |
| Email | `djuragan@gmail.com` |
| Password | `password1234` |

```bash
php artisan db:seed
```

> Ganti password tersebut sebelum digunakan di lingkungan produksi.

## Menjalankan Aplikasi

```bash
composer dev
```

Perintah tersebut menjalankan server dan proses develop secara bersamaan. Alternatif manual:

```bash
php artisan serve     # backend di http://localhost:8000
npm run dev           # Vite dev server (hot reload)
```

## Pengujian

```bash
php artisan test                # seluruh test
php artisan test --filter=StockOpnameExportTest   # test tertentu
composer test                   # clear config lalu jalankan test
```

Cakupan test meliputi export Excel stock opname, webhook notifikasi Xendit, dan halaman dasar aplikasi.

## Struktur Direktori

```
app/
├── Http/Controllers/
│   ├── Admin/            # Controller modul (produk, PO, transaksi, laporan, dll.)
│   └── Auth/             # Login & logout
├── Models/               # Model Eloquent (Product, Transaction, StockOpname, dll.)
└── Services/             # Logika bisnis (UserAccessService, StockOpnameExcelExporter, dll.)

resources/js/
├── Components/           # Komponen UI (Cart, BarcodeScanner, Receipt, dll.)
├── Layouts/              # Layout admin
├── Pages/                # Halaman Inertia per modul
└── utils/                # Helper (passkeys, dll.)

routes/
├── web.php               # Rute web + middleware role/permission
└── api.php               # Rute API (webhook Xendit)

database/
├── migrations/           # Skema database
└── seeders/              # Role, permission, dan user awal

tests/
├── Feature/              # Test fitur (export, webhook, dll.)
└── Unit/                 # Test unit
```

## Hak Akses

| Role | Keterangan |
| --- | --- |
| `admin` | Akses penuh ke seluruh modul, dapat mengelola user, role, dan passkey. |
| Non-admin | Akses sesuai permission yang diberikan; data difilter berdasarkan toko yang ditugaskan. |

Permission didefinisikan per modul dengan pola `{modul}.{aksi}` — contoh: `products.create`, `transactions.index`, `stock-opnames.show`.

## Kontribusi

Kontribusi diterima melalui pull request. Pastikan seluruh test lolos (`php artisan test`) dan jalankan formatter sebelum submit:

```bash
vendor/bin/pint --format agent
```

## Lisensi

Project ini dilisensikan di bawah [MIT License](https://opensource.org/licenses/MIT).
