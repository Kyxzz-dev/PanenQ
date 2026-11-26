# Fitur Tambahan: Perawatan Kebun

## 1. Deskripsi

Modul Perawatan Kebun merupakan fitur tambahan pada aplikasi Pencatatan Tandan Hasil Panen untuk mencatat, memantau, dan melaporkan aktivitas perawatan kebun kelapa sawit.

Fitur ini mencakup tiga jenis perawatan:

- Pemupukan
- Penyemprotan
- Pruning (pemangkasan pelepah)

Setiap catatan perawatan hanya berlaku untuk **satu blok kebun**. Jika satu aktivitas mencakup beberapa blok, pengguna harus membuat catatan terpisah untuk setiap blok.

Modul perawatan terintegrasi dengan data lokasi/blok kebun yang sudah tersedia, tetapi memiliki tabel database dan halaman tersendiri dari catatan panen.

## 2. Tujuan

- Mempermudah pencatatan aktivitas perawatan kebun.
- Memantau riwayat perawatan berdasarkan tanggal dan blok kebun.
- Mencatat penggunaan bahan dan biaya perawatan.
- Mengetahui blok kebun yang sudah dan belum mendapatkan perawatan.
- Menyediakan laporan perawatan berdasarkan periode tertentu.

## 3. Fitur Utama

### 3.1. Dashboard Perawatan

Menampilkan ringkasan aktivitas perawatan kebun, meliputi:

- Total aktivitas perawatan.
- Total biaya perawatan.
- Total blok yang telah mendapatkan perawatan.
- Ringkasan aktivitas berdasarkan jenis perawatan.
- Aktivitas perawatan terbaru.

Ringkasan dapat difilter berdasarkan periode tanggal.

### 3.2. CRUD Data Perawatan

Pengguna dapat:

- Menambahkan catatan perawatan.
- Melihat detail catatan perawatan.
- Mengubah catatan perawatan.
- Menghapus catatan perawatan.

Setiap catatan harus terhubung dengan satu blok kebun dan satu jenis perawatan.

### 3.3. Pemupukan

Mencatat aktivitas pemberian pupuk pada blok kebun.

Data khusus:
- Nama atau jenis pupuk.
- Dosis pupuk.
- Jumlah pupuk yang digunakan.
- Satuan penggunaan pupuk.
- Jumlah pohon yang dipupuk.
- Biaya pupuk.
- Biaya tenaga kerja.

Contoh:
- Blok: A
- Jenis pupuk: NPK
- Jumlah pupuk: 300 kg
- Jumlah pohon: 150 pohon

### 3.4. Penyemprotan

Mencatat aktivitas penyemprotan pada blok kebun.

Data khusus:
- Jenis bahan yang digunakan.
- Nama bahan atau produk.
- Dosis bahan.
- Jumlah bahan yang digunakan.
- Satuan penggunaan bahan.
- Luas area yang disemprot.
- Biaya bahan.
- Biaya tenaga kerja.

Contoh:
- Blok: A
- Jenis bahan: Herbisida
- Jumlah bahan: 2 liter
- Luas area: 1 hektare

### 3.5. Pruning (Pemangkasan)

Mencatat aktivitas pemangkasan pelepah pada blok kebun.

Data khusus:
- Jenis pekerjaan.
- Jumlah pohon yang dipangkas.
- Luas area yang dikerjakan (opsional).
- Biaya tenaga kerja.

Contoh:
- Blok: A
- Jumlah pohon: 120 pohon
- Jenis pekerjaan: Pemangkasan pelepah

### 3.6. Riwayat Perawatan

Menampilkan seluruh catatan perawatan yang telah dilakukan.

Fitur:
- Pencarian berdasarkan nama blok.
- Filter berdasarkan tanggal mulai dan tanggal selesai.
- Filter berdasarkan jenis perawatan.
- Filter berdasarkan pekerja.
- Pengurutan berdasarkan tanggal terbaru atau terlama.
- Detail catatan perawatan.
- Ekspor CSV berdasarkan data yang telah difilter.

## 4. Alur Penggunaan

1. Pengguna membuka menu Perawatan Kebun.
2. Pengguna memilih Tambah Perawatan.
3. Pengguna menentukan tanggal perawatan.
4. Pengguna memilih satu blok kebun.
5. Pengguna memilih jenis perawatan.
6. Sistem menampilkan kolom khusus sesuai jenis perawatan.
7. Pengguna mengisi data perawatan dan biaya.
8. Pengguna menyimpan catatan.
9. Backend melakukan validasi dan menyimpan data ke SQLite.
10. Catatan ditampilkan pada halaman Riwayat Perawatan.

## 5. Struktur Database

Database menggunakan SQLite yang sudah digunakan oleh aplikasi.

Tabel baru: `maintenance_records`

Tabel ini memiliki relasi dengan tabel `locations` dan `harvesters` yang sudah tersedia.

```sql
CREATE TABLE IF NOT EXISTS maintenance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    location_id INTEGER NOT NULL,
    harvester_id INTEGER,

    maintenance_type TEXT NOT NULL
        CHECK (
            maintenance_type IN (
                'pemupukan',
                'penyemprotan',
                'pruning'
            )
        ),

    maintenance_date DATE NOT NULL,

    material_name TEXT,
    dosage REAL,
    dosage_unit TEXT,

    quantity REAL,
    quantity_unit TEXT,

    area REAL,
    area_unit TEXT,

    tree_count INTEGER,

    material_cost REAL NOT NULL DEFAULT 0,
    labor_cost REAL NOT NULL DEFAULT 0,

    notes TEXT,

    created_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME,

    FOREIGN KEY (location_id)
        REFERENCES locations(id),

    FOREIGN KEY (harvester_id)
        REFERENCES harvesters(id)
);

CREATE INDEX IF NOT EXISTS
    idx_maintenance_date
ON maintenance_records(maintenance_date);

CREATE INDEX IF NOT EXISTS
    idx_maintenance_location
ON maintenance_records(location_id);

CREATE INDEX IF NOT EXISTS
    idx_maintenance_type
ON maintenance_records(maintenance_type);
```

### Keterangan Kolom

| Kolom | Keterangan |
|---|---|
| `location_id` | ID blok kebun |
| `harvester_id` | ID pekerja yang melakukan perawatan |
| `maintenance_type` | Jenis perawatan |
| `maintenance_date` | Tanggal pelaksanaan |
| `material_name` | Nama pupuk atau bahan semprot |
| `dosage` | Dosis penggunaan bahan |
| `dosage_unit` | Satuan dosis |
| `quantity` | Jumlah bahan yang digunakan |
| `quantity_unit` | Satuan jumlah bahan |
| `area` | Luas area yang dikerjakan |
| `area_unit` | Satuan luas area |
| `tree_count` | Jumlah pohon yang dirawat |
| `material_cost` | Biaya bahan |
| `labor_cost` | Biaya tenaga kerja |
| `notes` | Keterangan tambahan |

Kolom yang tidak relevan dengan jenis perawatan tertentu dapat bernilai `NULL`.

`harvester_id` bersifat opsional. Apabila pekerja yang melakukan perawatan bukan pemanen, sistem dapat menggunakan data pekerja tersendiri pada pengembangan berikutnya.

### Ketentuan Database

- Database tetap berada di `server/database/panen.db`.
- Tabel dibuat otomatis saat backend pertama kali dijalankan.
- Pembuatan tabel menggunakan `CREATE TABLE IF NOT EXISTS`.
- Data panen yang sudah ada tidak boleh dihapus atau diubah.
- Setiap catatan perawatan hanya memiliki satu `location_id`.
- Foreign key harus diaktifkan pada koneksi SQLite.
- Penghapusan blok kebun yang masih memiliki catatan perawatan harus dicegah atau ditangani dengan kebijakan yang jelas.

## 6. Endpoint REST API

| Method | Endpoint | Kegunaan |
|---|---|---|
| GET | `/api/maintenance-records` | Mengambil daftar catatan perawatan |
| POST | `/api/maintenance-records` | Menambahkan catatan perawatan |
| GET | `/api/maintenance-records/:id` | Mengambil detail catatan |
| PUT | `/api/maintenance-records/:id` | Mengubah catatan |
| DELETE | `/api/maintenance-records/:id` | Menghapus catatan |
| GET | `/api/maintenance-records/summary` | Ringkasan aktivitas perawatan |
| GET | `/api/reports/maintenance` | Laporan perawatan |

### Query Filter

```http
GET /api/maintenance-records?startDate=2026-11-01&endDate=2026-11-30&locationId=1&maintenanceType=pemupukan
```

Parameter:
- `startDate`: tanggal awal.
- `endDate`: tanggal akhir.
- `locationId`: ID blok kebun.
- `maintenanceType`: jenis perawatan.
- `harvesterId`: ID pekerja.

Seluruh parameter filter bersifat opsional.

### Contoh Request Tambah Perawatan

```json
{
  "locationId": 1,
  "harvesterId": 2,
  "maintenanceType": "pemupukan",
  "maintenanceDate": "2026-11-26",
  "materialName": "NPK",
  "dosage": 2,
  "dosageUnit": "kg/pohon",
  "quantity": 300,
  "quantityUnit": "kg",
  "treeCount": 150,
  "materialCost": 1500000,
  "laborCost": 300000,
  "notes": "Pemupukan rutin Blok A"
}
```

### Contoh Respons API

```json
{
  "success": true,
  "message": "Catatan perawatan berhasil ditambahkan",
  "data": {
    "id": 1,
    "locationId": 1,
    "maintenanceType": "pemupukan",
    "maintenanceDate": "2026-11-26",
    "materialName": "NPK",
    "quantity": 300,
    "quantityUnit": "kg",
    "treeCount": 150,
    "totalCost": 1800000
  }
}
```

## 7. Perhitungan Biaya

Total biaya perawatan dihitung dari biaya bahan dan biaya tenaga kerja.

```text
totalCost = materialCost + laborCost
```

Biaya dapat bernilai nol apabila tidak ada pengeluaran yang dicatat.

Seluruh perhitungan biaya dilakukan oleh backend. Frontend tidak boleh menjadi satu-satunya tempat perhitungan total biaya.

## 8. Laporan Perawatan

Laporan menampilkan data berdasarkan periode yang dipilih.

Informasi laporan:
- Tanggal perawatan.
- Nama blok kebun.
- Jenis perawatan.
- Nama bahan.
- Jumlah bahan.
- Luas area atau jumlah pohon.
- Biaya bahan.
- Biaya tenaga kerja.
- Total biaya.

Laporan juga menyediakan rekap berdasarkan jenis perawatan dan blok kebun.

### Ekspor CSV

CSV dibentuk dari data yang sudah difilter.

Nama file mengikuti periode laporan, misalnya:

`laporan-perawatan-2026-11-01-2026-11-30.csv`

## 9. Perubahan Frontend

Tambahkan menu baru:

```text
Dashboard
Data Master
Perawatan Kebun
  ├── Daftar Perawatan
  ├── Tambah Perawatan
  └── Laporan Perawatan
Catatan Panen
Laporan Panen
```

Halaman yang perlu dibuat:

- `MaintenanceRecordsPage`: daftar dan filter catatan perawatan.
- `MaintenanceFormPage`: form tambah dan ubah perawatan.
- `MaintenanceDetailPage`: detail catatan perawatan.
- `MaintenanceReportPage`: laporan dan ekspor CSV.

Nama file dan struktur folder dapat menyesuaikan struktur React yang sudah digunakan.

### Ketentuan Form

- Blok kebun wajib dipilih.
- Jenis perawatan wajib dipilih.
- Tanggal perawatan wajib diisi.
- Kolom khusus berubah berdasarkan jenis perawatan.
- Jumlah bahan, luas area, jumlah pohon, dan biaya harus bernilai nol atau positif.
- Data yang tidak relevan tidak dikirim sebagai nilai kosong yang tidak valid.

## 10. Validasi Backend

Backend harus melakukan validasi terhadap:

- Blok kebun harus tersedia dan aktif.
- Jenis perawatan hanya boleh berupa `pemupukan`, `penyemprotan`, atau `pruning`.
- Tanggal harus memiliki format yang valid.
- Jumlah bahan, luas area, jumlah pohon, dan biaya tidak boleh negatif.
- ID pekerja harus valid apabila diisi.
- Data khusus harus sesuai dengan jenis perawatan.
- Catatan yang tidak ditemukan harus menghasilkan respons `404`.
- Kesalahan validasi menghasilkan respons `400`.
- Kesalahan server ditangani dengan respons `500` tanpa membocorkan informasi internal.

## 11. Kriteria Selesai

Fitur dinyatakan selesai apabila:

- Pengguna dapat menambahkan catatan pemupukan, penyemprotan, dan pruning.
- Setiap catatan hanya terkait dengan satu blok kebun.
- Pengguna dapat melihat, mengubah, dan menghapus catatan perawatan.
- Filter tanggal, blok, jenis perawatan, dan pekerja berfungsi.
- Ringkasan biaya dan aktivitas perawatan ditampilkan dengan benar.
- Laporan perawatan dapat diekspor ke CSV.
- Data perawatan tersimpan di SQLite.
- Data panen yang sudah ada tetap aman.
- Seluruh operasi database dilakukan melalui backend Express.
- Fitur dapat digunakan pada aplikasi React yang sudah berjalan.

## 12. Catatan Pengembangan

Implementasi dilakukan secara bertahap tanpa mengubah arsitektur aplikasi yang sudah ada.

Arsitektur:

```text
React + Vite
      |
      v
Express REST API
      |
      v
SQLite
  ├── locations
  ├── harvesters
  ├── harvest_records
  └── maintenance_records
```

Autentikasi dan otorisasi multi-user belum termasuk dalam fitur ini.

Untuk pengembangan lanjutan, modul perawatan dapat diperluas dengan penjadwalan perawatan, stok bahan, dan pencatatan pekerja khusus perawatan.
