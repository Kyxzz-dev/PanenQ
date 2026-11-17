# Aplikasi Pencatatan Tandan Hasil Panen

Starter MVP berbasis React + Vite, Node.js + Express, dan SQLite.

## Fitur
- Dashboard ringkasan total tandan, berat, dan transaksi.
- CRUD lokasi/blok kebun.
- CRUD data pemanen.
- CRUD catatan panen.
- Filter riwayat berdasarkan tanggal, lokasi, dan pemanen.
- Laporan periode dan ekspor CSV.
- SQLite otomatis membuat database dan tabel saat backend pertama kali dijalankan.

## Arsitektur
`client (React)` → `server (Express REST API)` → `SQLite (server/database/panen.db)`

Browser tidak mengakses file SQLite secara langsung. Semua operasi database dilakukan oleh backend.

## Persyaratan
- Node.js 20 atau lebih baru
- npm

## Menjalankan aplikasi

### 1. Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Backend berjalan di `http://localhost:4000`.

### 2. Frontend
Buka terminal baru:
```bash
cd client
npm install
npm run dev
```
Buka URL yang ditampilkan Vite (biasanya `http://localhost:5173`).

## Endpoint utama
| Method | Endpoint | Kegunaan |
|---|---|---|
| GET | `/api/health` | Status API |
| GET/POST | `/api/locations` | Daftar/tambah lokasi |
| PUT/DELETE | `/api/locations/:id` | Ubah/hapus lokasi |
| GET/POST | `/api/harvesters` | Daftar/tambah pemanen |
| PUT/DELETE | `/api/harvesters/:id` | Ubah/hapus pemanen |
| GET/POST | `/api/harvest-records` | Daftar/tambah catatan |
| GET/PUT/DELETE | `/api/harvest-records/:id` | Detail/ubah/hapus catatan |
| GET | `/api/dashboard/summary` | Ringkasan dashboard |
| GET | `/api/reports/summary` | Rekap laporan |

### Query filter catatan
`GET /api/harvest-records?startDate=2026-11-01&endDate=2026-11-30&locationId=1&harvesterId=2`

### Ekspor CSV
Frontend membentuk CSV dari data yang sudah difilter pada halaman Riwayat.

## Catatan pengembangan
- Database dibuat otomatis pada `server/database/panen.db`.
- Untuk backup, hentikan backend lalu salin file database tersebut.
- Data awal lokasi/pemanen dapat ditambahkan melalui menu Data Master.
- Autentikasi multi-user belum diaktifkan pada MVP ini. Tambahkan login dan otorisasi sebelum aplikasi dipublikasikan ke jaringan publik.
- Untuk akses beberapa perangkat, jalankan backend pada satu komputer/server LAN dan atur `VITE_API_URL` di `client/.env` sesuai alamat server.
