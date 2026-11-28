

# Panenku — Penambahan GeoJSON pada Data Master Lokasi/Blok

## 1. Tujuan

Menambahkan informasi batas geografis blok kebun menggunakan file GeoJSON pada menu **Data Master → Lokasi/Blok**.

Fitur ini melengkapi CRUD lokasi/blok yang sudah ada. Data lokasi tetap dapat dibuat dan digunakan untuk pencatatan panen meskipun belum memiliki GeoJSON.

Arsitektur tetap:

`client (React + Vite)` → `server (Express REST API)` → `SQLite (server/database/panen.db)`

Browser tidak mengakses file SQLite secara langsung. Seluruh proses penyimpanan, pembacaan, dan penghapusan GeoJSON dilakukan melalui backend Express.

## 2. Ruang Lingkup MVP

Fitur yang ditambahkan:

- Mengunggah file `.geojson` atau `.json` pada form tambah/edit lokasi.
- Memvalidasi isi file sebelum disimpan.
- Menampilkan pratinjau polygon sebelum pengguna menyimpan.
- Menampilkan batas blok pada halaman detail lokasi.
- Mengganti atau menghapus GeoJSON dari lokasi.
- Menampilkan status GeoJSON pada daftar lokasi.
- Menyimpan GeoJSON di SQLite.

Belum termasuk dalam MVP:

- Menggambar polygon langsung pada peta.
- Mengedit titik koordinat secara manual.
- Analisis GIS lanjutan.
- Impor banyak file sekaligus.

## 3. Perubahan pada Data Master → Lokasi/Blok

### 3.1 Daftar Lokasi/Blok

Daftar lokasi menampilkan:

| Informasi        | Keterangan                                 |
| ---------------- | ------------------------------------------ |
| Nama lokasi/blok | Nama yang sudah digunakan pada data master |
| Deskripsi        | Deskripsi lokasi jika tersedia             |
| GeoJSON          | Status batas geografis                     |
| Aksi             | Detail, edit, hapus                        |

Status GeoJSON:

- **Tersedia** — lokasi memiliki batas GeoJSON yang valid.
- **Belum ditambahkan** — lokasi belum memiliki batas geografis.

Jangan memuat seluruh koordinat GeoJSON pada setiap baris daftar. Daftar hanya memerlukan metadata dan status agar respons API tetap ringan.

### 3.2 Form Tambah/Edit Lokasi

Form mempertahankan kolom yang sudah ada:

- Nama lokasi/blok — wajib.
- Deskripsi — opsional.

Tambahkan bagian **Batas Blok (GeoJSON)**:

- Input unggah file `.geojson` atau `.json`.
- Nama file dan ukuran file.
- Status validasi.
- Pratinjau polygon jika file valid.
- Aksi untuk mengganti atau menghapus file yang dipilih.

GeoJSON bersifat opsional. Pengguna tetap dapat menyimpan lokasi tanpa file GeoJSON.

### 3.3 Detail Lokasi

Halaman detail lokasi menampilkan:

- Nama dan deskripsi lokasi.
- Status GeoJSON.
- Peta batas lokasi jika GeoJSON tersedia.
- Aksi **Ganti GeoJSON**, **Ekspor GeoJSON**, dan **Hapus Batas**.

Jika lokasi belum memiliki GeoJSON, tampilkan pesan bahwa batas geografis belum ditambahkan.

## 4. Format dan Validasi GeoJSON

### Format yang didukung

- File `.geojson` atau `.json`.
- Geometri `Polygon` atau `MultiPolygon`.
- Sistem koordinat WGS84 / EPSG:4326.
- Urutan koordinat GeoJSON: `[longitude, latitude]`.

Untuk MVP, dukung GeoJSON berbentuk `Feature`, `FeatureCollection` dengan satu fitur polygon, atau geometri Polygon/MultiPolygon langsung.

Jika `FeatureCollection` berisi beberapa fitur, backend harus menolak file dengan pesan yang jelas atau secara eksplisit menggabungkan fitur sesuai aturan yang ditetapkan. Jangan mengabaikan fitur tambahan secara diam-diam.

### Validasi minimum

Backend harus memvalidasi file sebelum menyimpannya:

1. File dapat dibaca dan merupakan JSON yang valid.
2. Struktur GeoJSON termasuk format yang didukung.
3. Geometri berupa Polygon atau MultiPolygon.
4. Koordinat berupa angka dan berada dalam rentang longitude/latitude yang valid.
5. Ring polygon tertutup.
6. Polygon memiliki jumlah titik minimum yang diperlukan.
7. Geometri tidak kosong.
8. Ukuran file tidak melebihi batas unggahan yang ditetapkan.
9. Struktur file tidak mengandung tipe geometri yang belum didukung.

Jika validasi gagal, backend mengembalikan error yang jelas dan tidak mengubah GeoJSON yang sudah tersimpan.

Validasi geometri yang lebih mendalam dapat ditambahkan menggunakan library GIS jika dibutuhkan. Jangan menganggap validasi JSON saja sudah menjamin polygon valid secara spasial.

## 5. Penyimpanan pada SQLite

Untuk MVP, simpan GeoJSON sebagai teks JSON pada kolom `TEXT`. SQLite tidak perlu diakses langsung oleh frontend.

Tambahkan kolom opsional pada tabel lokasi yang sudah ada:

```sql
ALTER TABLE locations
ADD COLUMN geojson TEXT;
```

Kolom `geojson` berisi geometri GeoJSON yang telah divalidasi. Kolom ini boleh bernilai `NULL` jika lokasi belum memiliki batas geografis.

Jika tabel `locations` belum memiliki kolom tersebut, jalankan perubahan skema melalui mekanisme inisialisasi atau migrasi database yang digunakan proyek. Jangan membuat tabel lokasi kedua.

### Catatan penyimpanan

- Jangan mengubah ID lokasi yang sudah digunakan oleh catatan panen.
- Jangan menghapus atau menimpa data lokasi lain saat mengimpor GeoJSON.
- Saat pengguna mengganti GeoJSON, perbarui hanya batas milik lokasi yang dipilih.
- Jika file tidak valid, pertahankan GeoJSON lama.
- Backup tetap dilakukan dengan menghentikan backend lalu menyalin `server/database/panen.db`.

GeoJSON disimpan sebagai data geometri, bukan sebagai path file lokal. Dengan demikian, backend tidak perlu menyimpan file unggahan terpisah untuk MVP ini.

## 6. API Express

Gunakan endpoint lokasi yang sudah ada. Tambahkan endpoint berikut untuk pengelolaan GeoJSON.

| Method   | Endpoint                     | Kegunaan                                          |
| -------- | ---------------------------- | ------------------------------------------------- |
| `GET`    | `/api/locations`             | Daftar lokasi beserta metadata dan status GeoJSON |
| `POST`   | `/api/locations`             | Tambah lokasi; GeoJSON opsional                   |
| `GET`    | `/api/locations/:id`         | Detail lokasi                                     |
| `PUT`    | `/api/locations/:id`         | Ubah informasi lokasi                             |
| `DELETE` | `/api/locations/:id`         | Hapus lokasi sesuai aturan relasi yang sudah ada  |
| `GET`    | `/api/locations/:id/geojson` | Mengambil GeoJSON satu lokasi                     |
| `PUT`    | `/api/locations/:id/geojson` | Mengganti atau menambahkan GeoJSON                |
| `DELETE` | `/api/locations/:id/geojson` | Menghapus GeoJSON dari lokasi                     |

Endpoint `GET /api/locations` sebaiknya mengembalikan metadata seperti `hasGeojson`, bukan seluruh isi kolom `geojson`.

Contoh respons daftar:

```json
{
  "id": 1,
  "name": "Blok A-01",
  "description": "Blok kebun utara",
  "hasGeojson": true
}
```

Endpoint `GET /api/locations/:id/geojson` mengembalikan GeoJSON lokasi tersebut. Jika lokasi tidak ditemukan, kembalikan `404`. Jika lokasi ada tetapi belum memiliki GeoJSON, kembalikan respons yang konsisten dan terdokumentasi, misalnya `404` dengan kode error `GEOJSON_NOT_FOUND`.

### Impor GeoJSON

Untuk MVP, frontend dapat mengirim isi file sebagai JSON ke endpoint `PUT /api/locations/:id/geojson`.

Contoh request:

```http
PUT /api/locations/1/geojson
Content-Type: application/json
```

```json
{
  "geojson": {
    "type": "Polygon",
    "coordinates": [
      [
        [98.6501, 3.5901],
        [98.6510, 3.5901],
        [98.6510, 3.5910],
        [98.6501, 3.5910],
        [98.6501, 3.5901]
      ]
    ]
  }
}
```

Koordinat di atas hanya contoh format, bukan batas lokasi kebun yang sebenarnya.

Backend harus memvalidasi isi `geojson` sebelum menjalankan query `UPDATE`.

## 7. Tampilan Peta

Gunakan library peta pada frontend, misalnya Leaflet dengan React Leaflet.

Kebutuhan tampilan:

- Peta hanya dimuat pada halaman detail lokasi atau halaman peta.
- Polygon ditampilkan sesuai koordinat GeoJSON.
- Peta menyesuaikan zoom agar polygon terlihat.
- Tampilkan pesan jika lokasi belum memiliki GeoJSON.
- Tampilkan loading dan error state saat mengambil GeoJSON.

Jangan memuat komponen peta pada seluruh halaman aplikasi. Komponen peta dapat dimuat secara lazy agar halaman dashboard, riwayat, dan form biasa tidak ikut memuat library peta.

## 8. Performa

Agar penambahan GeoJSON tidak membuat web terasa berat:

- Jangan mengirim seluruh koordinat pada respons daftar lokasi.
- Ambil GeoJSON hanya saat pengguna membuka detail atau peta.
- Tetapkan batas ukuran file unggahan.
- Hindari menampilkan seluruh polygon jika jumlah blok sangat banyak.
- Sederhanakan geometri yang memiliki terlalu banyak titik jika diperlukan.
- Tampilkan loading state saat GeoJSON sedang diambil atau diproses.

Untuk MVP, cukup tampilkan satu polygon lokasi pada halaman detail. Peta gabungan seluruh blok dapat dikembangkan setelah kebutuhan dan jumlah data diketahui.

## 9. Integrasi dengan Catatan Panen

GeoJSON hanya menambahkan batas geografis pada lokasi/blok. Data panen tetap mengacu pada ID lokasi yang sudah digunakan.

Penambahan fitur ini tidak boleh mengubah:

- Relasi catatan panen dengan lokasi.
- Endpoint catatan panen yang sudah ada.
- Filter riwayat berdasarkan lokasi.
- Laporan dan ekspor CSV yang sudah ada.

Jika GeoJSON lokasi diubah atau dihapus, catatan panen sebelumnya tetap tersimpan.

## 10. Kriteria Penerimaan

- [ ] Lokasi dapat dibuat tanpa GeoJSON.
- [ ] Pengguna dapat mengunggah GeoJSON pada form tambah/edit lokasi.
- [ ] File valid dapat dipratinjau sebelum disimpan.
- [ ] File tidak valid ditolak dengan pesan yang jelas.
- [ ] GeoJSON tersimpan pada lokasi yang benar.
- [ ] GeoJSON lama tetap ada jika file pengganti tidak valid.
- [ ] Pengguna dapat melihat batas lokasi pada halaman detail.
- [ ] Pengguna dapat mengganti, mengekspor, dan menghapus GeoJSON.
- [ ] Daftar lokasi tidak mengirim seluruh koordinat GeoJSON.
- [ ] Catatan panen dan filter lokasi tetap berjalan seperti sebelumnya.
- [ ] Backup database tetap mencakup data GeoJSON.

## 11. Tahapan Implementasi

1. Tambahkan kolom `geojson` pada tabel `locations`.
2. Perbarui model dan query lokasi pada backend Express.
3. Tambahkan validasi dan endpoint GeoJSON.
4. Tambahkan input unggah dan pratinjau pada form lokasi.
5. Tambahkan tampilan peta pada detail lokasi.
6. Tambahkan aksi ganti, ekspor, dan hapus GeoJSON.
7. Uji lokasi tanpa GeoJSON, file valid, file tidak valid, dan file berukuran besar.
8. Pastikan CRUD lokasi, catatan panen, filter, laporan, dan ekspor CSV tetap berjalan.

