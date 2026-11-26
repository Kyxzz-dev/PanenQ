# PANENKU — Responsive Web App & Design System

## 1. Project Overview

Panenku merupakan aplikasi manajemen perkebunan kelapa sawit yang digunakan untuk mencatat hasil panen, mengelola data blok kebun, mengelola pekerja, mencatat aktivitas perawatan, dan menghasilkan laporan operasional.

Aplikasi dikembangkan menggunakan pendekatan Responsive Web Application dengan dukungan Progressive Web App (PWA) sebagai pengembangan lanjutan.

### Tujuan Pengembangan

- Menghasilkan antarmuka modern, profesional, dan responsif.
- Memberikan pengalaman penggunaan yang nyaman di desktop, tablet, dan smartphone.
- Menggunakan desain Botanical Modern sebagai identitas visual.
- Menyediakan Light Mode dan Dark Mode.
- Menggunakan animasi yang halus dan tidak mengganggu aktivitas operasional.
- Mempertahankan integrasi penuh dengan REST API backend yang sudah tersedia (modul Panen, Data Master, dan Perawatan Kebun).
- Menyiapkan fondasi untuk penggunaan multi-user dan PWA pada pengembangan lanjutan.

## 2. Technology Stack

### Baseline Implementasi Saat Ini (Current Codebase)

Sebelum melakukan upgrade redesign UI, kondisi kode yang sudah berjalan di workspace adalah:

- **Frontend (`client/`)**: React 18, Vite 6, Lucide React, CSS custom (`client/src/styles.css`), `fetch` API wrapper (`client/src/services/api.js`), serta navigasi halaman berbasis state di `App.jsx`.
- **Backend (`server/`)**: Node.js, Express 4, SQLite (`better-sqlite3`) pada `server/database/panen.db` dengan empat tabel aktif: `locations`, `harvesters`, `harvest_records`, dan `maintenance_records`.
- **Autentikasi**: Belum diaktifkan pada fase saat ini (seluruh endpoint `/api/*` berjalan terbuka untuk aplikasi client lokal/LAN; autentikasi multi-user masuk tahap lanjutan).

### Target Stack Redesign Frontend

| Teknologi | Fungsi |
|---|---|
| React | UI framework |
| Vite | Development server dan build tool |
| Tailwind CSS v4 | Styling dan responsive design |
| Motion | UI animation dan transitions |
| shadcn/ui | Reusable UI components |
| Lucide React | Icon system |
| Recharts | Dashboard charts (panen & perawatan) |
| React Router | Client-side routing |
| React Hook Form | Form management |
| Zod | Form validation |
| Axios / Fetch Wrapper | HTTP client ke REST API |
| date-fns | Date formatting |

### Backend

Backend tetap menggunakan REST API Express + SQLite yang sudah tersedia tanpa perubahan skema atau penghapusan endpoint.

- Node.js + Express.js
- SQLite (`server/database/panen.db`) untuk MVP lokal, atau PostgreSQL sebagai opsi deployment multi-user di masa depan.
- REST API sebagai satu-satunya jalur komunikasi antara frontend dan database.

### Prinsip Arsitektur

```text
React + Vite
      |
      v
React Router
      |
      v
Reusable UI Components
      |
      v
API Service Layer
      |
      v
Express REST API
      |
      v
Database
```

Frontend tidak boleh mengakses database secara langsung.

## 3. Design Direction

### Konsep Visual

Nama konsep: **Botanical Modern Dashboard**

Karakteristik:

- Modern.
- Natural.
- Minimalis.
- Profesional.
- Clean interface.
- Premium SaaS appearance.
- Mobile-first responsive layout.

Desain harus mencerminkan aplikasi manajemen perkebunan, bukan website company profile atau landing page.

### Referensi Visual

Gunakan pendekatan visual seperti:

- Modern agricultural SaaS dashboard.
- Botanical-inspired interface.
- Premium green productivity dashboard.
- Clean enterprise dashboard.
- Modern mobile management application.

## 4. Design System

### 4.1. Color Palette

#### Light Mode

| Token | Hex | Kegunaan |
|---|---|---|
| Background | `#F5F8F2` | Background utama |
| Surface | `#FFFFFF` | Card dan panel |
| Primary | `#245C3A` | Tombol dan elemen utama |
| Secondary | `#527A5D` | Elemen sekunder |
| Accent | `#A7C99C` | Highlight |
| Border | `#E3EADF` | Border |
| Text Primary | `#1C2B20` | Teks utama |
| Text Secondary | `#758078` | Teks sekunder |

#### Dark Mode

| Token | Hex | Kegunaan |
|---|---|---|
| Background | `#111A14` | Background utama |
| Surface | `#1B2920` | Card dan panel |
| Primary | `#8DC69B` | Tombol dan elemen utama |
| Secondary | `#547A5D` | Elemen sekunder |
| Accent | `#B7D8A8` | Highlight |
| Border | `#304237` | Border |
| Text Primary | `#EDF5ED` | Teks utama |
| Text Secondary | `#A0AEA2` | Teks sekunder |

Gunakan CSS variables atau semantic design tokens agar perubahan tema tidak perlu dilakukan pada setiap komponen.

### 4.2. Typography

Font utama: Inter.

| Elemen | Ukuran | Weight |
|---|---|---|
| Page Heading | 28–30px | 700 |
| Section Heading | 20–24px | 600 |
| Card Heading | 16–18px | 600 |
| Body | 14–16px | 400 |
| Caption | 12–13px | 400 |
| Statistic | 28–36px | 700 |

### 4.3. Border Radius

| Komponen | Radius |
|---|---|
| Card | 16–20px |
| Button | 10–12px |
| Input | 10px |
| Modal | 18–20px |
| Dropdown | 10px |
| Badge | Full rounded |

### 4.4. Background Design

Gunakan pendekatan Botanical Background:

- Soft green gradient.
- Radial gradient hijau muda.
- Organic leaf pattern dengan opacity rendah.
- Subtle blur decoration.
- Background tidak boleh mengganggu keterbacaan informasi.

Hindari penggunaan gambar perkebunan berukuran besar sebagai background halaman operasional.

## 5. Responsive Layout

Aplikasi harus dirancang mobile-first dan mendukung berbagai ukuran layar.

### Breakpoints

| Device | Width |
|---|---|
| Mobile | 320–639px |
| Tablet | 640–1023px |
| Desktop | 1024–1279px |
| Large Desktop | 1280px ke atas |

### 5.1. Desktop Layout

Menggunakan:

- Persistent sidebar.
- Top navigation bar.
- Main content area.
- Dashboard grid.
- Data table.
- Multi-column forms.

Sidebar berisi struktur menu sesuai modul terbaru:

```text
PANENKU

RINGKASAN
└── Dashboard

DATA MASTER
├── Lokasi / Blok
└── Data Pemanen

PERAWATAN KEBUN
├── Dashboard Perawatan
├── Daftar Perawatan
├── Tambah Perawatan
└── Laporan Perawatan

PANEN
├── Catatan Panen
└── Laporan Panen

PREFERENSI (Tahap Redesign / Multi-User)
├── Pengaturan Tema (Light / Dark)
└── Profil (saat autentikasi aktif)
```

Halaman `Detail Perawatan` dibuka dari `Daftar Perawatan`, `Dashboard Perawatan`, atau `Laporan Perawatan` dengan tetap menyorot menu `Daftar Perawatan` sebagai aktif.

Sidebar dapat dibuat collapsible pada desktop.

### 5.2. Tablet Layout

- Sidebar dapat diubah menjadi drawer.
- Grid menggunakan dua kolom jika memungkinkan.
- Tabel mendukung horizontal scrolling atau responsive card.
- Form tetap nyaman digunakan dengan layar sentuh.

### 5.3. Mobile Layout

Menggunakan Bottom Navigation.

Menu utama:

```text
HOME
PANEN
PERAWATAN
LAPORAN
PROFIL
```

Ketentuan:

- Bottom navigation selalu mudah dijangkau.
- Sidebar desktop tidak ditampilkan.
- Konten menggunakan satu kolom.
- Card menggunakan lebar penuh.
- Form menggunakan input yang nyaman disentuh.
- Tombol utama dapat menggunakan full width.
- Tabel kompleks dapat ditampilkan dalam bentuk card list.
- Modal dapat berubah menjadi bottom sheet pada layar kecil.

Perhatikan safe-area pada perangkat mobile agar navigasi tidak tertutup sistem operasi.

## 6. Component Architecture

Seluruh UI harus menggunakan reusable components.

### Layout Components

```text
components/
└── layout/
    ├── AppLayout.jsx
    ├── AppSidebar.jsx
    ├── MobileNavbar.jsx
    ├── Topbar.jsx
    ├── PageHeader.jsx
    └── PageTransition.jsx
```

### UI Components

```text
components/
└── ui/
    ├── Button
    ├── Card
    ├── Input
    ├── Select
    ├── Dialog
    ├── DropdownMenu
    ├── DataTable
    ├── Badge
    ├── Skeleton
    ├── DatePicker
    └── EmptyState
```

Gunakan shadcn/ui sebagai fondasi komponen dan lakukan penyesuaian styling berdasarkan design system Panenku.

Jangan membuat ulang komponen dasar jika sudah tersedia pada shadcn/ui.

## 7. Page Architecture

### 7.1. Dashboard

Dashboard menjadi halaman utama saat aplikasi dibuka (dan menjadi landing page setelah login ketika autentikasi multi-user ditambahkan di tahap lanjutan).

Informasi yang ditampilkan:

- **Dashboard Utama (Panen)**:
  - Total tandan hari ini.
  - Total berat panen hari ini (`kg`).
  - Total transaksi panen hari ini.
  - Total tandan keseluruhan.
  - Grafik hasil panen (tahap redesign dengan Recharts).
  - Enam catatan panen terbaru.
- **Dashboard Perawatan** (`MaintenanceDashboardPage`):
  - Filter periode tanggal (`startDate`, `endDate`) beserta reset semua periode.
  - Total aktivitas perawatan.
  - Total biaya perawatan (`Rp`).
  - Jumlah blok kebun yang sudah dirawat vs belum dirawat pada periode terpilih.
  - Ringkasan aktivitas dan biaya per jenis perawatan (`pemupukan`, `penyemprotan`, `pruning`).
  - Grafik aktivitas/biaya perawatan (tahap redesign dengan Recharts).
  - Enam aktivitas perawatan terbaru.

Dashboard harus menggunakan data dari API (`/api/dashboard/summary` dan `/api/maintenance-records/summary`), bukan angka dummy pada implementasi final.

### 7.2. Data Master

Halaman pengelolaan:

- **Lokasi / Blok** (`/api/locations`): nama blok, deskripsi, dan jumlah catatan terkait. Penghapusan blok yang masih digunakan oleh `harvest_records` atau `maintenance_records` dicegah oleh backend (`409 Conflict`).
- **Data Pemanen / Pekerja** (`/api/harvesters`): nama pekerja, kode pekerja (`employee_code` unik opsional), dan status aktif (`is_active`).

Fitur:

- CRUD.
- Search / filter.
- Pagination jika data bertambah banyak.
- Form validation.
- Confirmation dialog sebelum penghapusan.

### 7.3. Catatan Panen

Fitur:

- Tambah catatan panen (`harvest_date`, `location_id`, `harvester_id` opsional, `bunch_count`, `total_weight_kg` opsional, `notes`).
- Edit catatan panen.
- Hapus catatan panen.
- Filter tanggal (`startDate`, `endDate`), lokasi/blok (`locationId`), dan pemanen (`harvesterId`).
- Riwayat panen + ringkasan total tandan hasil filter.
- Ekspor CSV (`laporan-panen-YYYY-MM-DD.csv`).

### 7.4. Perawatan Kebun

Jenis perawatan:

- **Pemupukan** (`pemupukan`): nama/jenis pupuk (`materialName` wajib), dosis & satuan (`dosage`, `dosageUnit`), jumlah pupuk & satuan (`quantity`, `quantityUnit`), jumlah pohon (`treeCount`), biaya pupuk (`materialCost`), biaya tenaga kerja (`laborCost`).
- **Penyemprotan** (`penyemprotan`): jenis bahan (`materialCategory`: Herbisida/Insektisida/Fungisida/Lainnya), nama bahan/produk (`materialName` wajib), dosis & satuan (`dosage`, `dosageUnit`), jumlah bahan & satuan (`quantity`, `quantityUnit`), luas area & satuan (`area`, `areaUnit`), biaya bahan (`materialCost`), biaya tenaga kerja (`laborCost`).
- **Pruning** (`pruning`): jenis pekerjaan (`workType` wajib, default `Pemangkasan pelepah`), jumlah pohon dipangkas (`treeCount`), luas area opsional & satuan (`area`, `areaUnit`), biaya tenaga kerja (`laborCost`, sedangkan `materialCost` dikunci `0` di backend).

Halaman & fitur:

- **Dashboard Perawatan**: ringkasan periode, status blok sudah vs belum dirawat, dan rekap jenis perawatan.
- **Daftar Perawatan**: pencarian nama blok (`search`), filter tanggal (`startDate`, `endDate`), blok (`locationId`), jenis perawatan (`maintenanceType`), pekerja (`harvesterId`), pengurutan terbaru/terlama (`sort=newest|oldest`), dan ekspor CSV.
- **Tambah & Ubah Perawatan**: form dinamis berdasarkan jenis perawatan; field tidak relevan tidak dikirim sebagai nilai kosong tidak valid dan dinormalisasi `NULL` oleh backend.
- **Detail Perawatan**: rincian lengkap satu catatan beserta rincian biaya (`materialCost`, `laborCost`, `totalCost`) dan stempel waktu (`createdAt`, `updatedAt`).

Aturan bisnis utama:

- Setiap catatan perawatan hanya terhubung dengan **satu blok kebun** (`locationId`).
- Pekerja (`harvesterId`) bersifat opsional.
- Seluruh perhitungan `totalCost = materialCost + laborCost` dilakukan dan divalidasi oleh backend.

### 7.5. Laporan

Terdiri dari dua laporan operasional:

- **Laporan Panen** (`/api/reports/summary`):
  - Filter periode (`startDate`, `endDate`).
  - Total tandan, total berat (`kg`), dan jumlah transaksi.
  - Rekap hasil panen per lokasi/blok.
- **Laporan Perawatan** (`/api/reports/maintenance`):
  - Filter periode (`startDate`, `endDate`), jenis perawatan (`maintenanceType`), dan blok kebun (`locationId`).
  - Total aktivitas, total biaya bahan, total biaya tenaga kerja, dan total biaya perawatan.
  - Rekap berdasarkan jenis perawatan dan berdasarkan blok kebun.
  - Tabel rincian perawatan lengkap (klik baris menuju halaman Detail Perawatan).
  - Ekspor CSV mengikuti periode filter (`laporan-perawatan-<startDate>-<endDate>.csv`).

## 8. Animation System

Gunakan Motion (`motion/react`).

### Animation Principles

Animasi harus:

- Smooth.
- Subtle.
- Consistent.
- Tidak menghambat navigasi.
- Tidak mengganggu proses input.
- Mengutamakan performa mobile.

### Animation Specification

| Interaksi | Durasi |
|---|---|
| Button press | 100–150ms |
| Card hover | 150–200ms |
| Page transition | 200–300ms |
| Modal transition | 200–250ms |
| Sidebar transition | 200–300ms |
| Dashboard entrance | 300–400ms |

### Animasi yang Digunakan

1. Fade-in ketika halaman dibuka.
2. Slide-up ringan pada dashboard cards.
3. Smooth transition ketika berpindah halaman.
4. Scale animation pada button interaction.
5. Fade dan scale pada dialog.
6. Skeleton shimmer ketika data sedang dimuat.
7. Count-up animation pada statistik.
8. Smooth chart animation.

Hindari animasi berlebihan pada tabel, form, dan elemen yang sering digunakan.

Implementasikan dukungan `prefers-reduced-motion`.

## 9. Light Mode & Dark Mode

Aplikasi wajib mendukung dua mode tampilan.

### Ketentuan

- Pengguna dapat mengganti tema secara manual.
- Tema dapat disimpan menggunakan localStorage.
- Pilihan tema harus tetap konsisten setelah halaman dimuat ulang.
- Semua komponen harus mendukung kedua tema.
- Hindari hardcoded colors pada komponen.
- Gunakan semantic CSS variables.

Tema default dapat mengikuti preferensi sistem operasi pengguna.

## 10. PWA Preparation

Panenku dipersiapkan untuk menjadi Progressive Web App.

Fitur yang direncanakan:

- Installable application.
- Web app manifest.
- App icons.
- Splash screen.
- Service worker.
- Offline fallback.
- Update notification.

### Offline Mode

Offline mode merupakan pengembangan lanjutan.

Rencana implementasi:

1. Data referensi tertentu dapat disimpan secara lokal.
2. Pengguna dapat membuat catatan sementara saat offline.
3. Data dimasukkan ke antrean sinkronisasi.
4. Ketika koneksi kembali tersedia, sistem mengirim data ke backend.
5. Backend melakukan validasi sebelum penyimpanan.
6. Sistem menangani konflik data dan kegagalan sinkronisasi.

Gunakan IndexedDB untuk penyimpanan data operasional offline.

Jangan menyimpan data sensitif atau token autentikasi secara sembarangan pada cache service worker.

## 11. API Integration

Frontend harus berkomunikasi melalui API service layer yang terhubung ke REST API backend (`VITE_API_URL`, default `http://localhost:4000/api`).

### Endpoint Backend yang Tersedia

| Modul | Method | Endpoint | Kegunaan |
|---|---|---|---|
| System | GET | `/api/health` | Status server dan koneksi SQLite |
| Master | GET/POST | `/api/locations` | Daftar & tambah blok kebun |
| Master | PUT/DELETE | `/api/locations/:id` | Ubah & hapus blok (`409` jika masih dipakai) |
| Master | GET/POST | `/api/harvesters` | Daftar & tambah pekerja/pemanen |
| Master | PUT/DELETE | `/api/harvesters/:id` | Ubah & hapus pekerja |
| Panen | GET/POST | `/api/harvest-records` | Daftar (dengan filter) & tambah catatan panen |
| Panen | GET/PUT/DELETE | `/api/harvest-records/:id` | Detail, ubah, & hapus catatan panen |
| Panen | GET | `/api/dashboard/summary` | Ringkasan dashboard panen & 6 catatan terbaru |
| Panen | GET | `/api/reports/summary` | Laporan panen per periode & per lokasi |
| Perawatan | GET | `/api/maintenance-records` | Daftar perawatan (filter `startDate`, `endDate`, `locationId`, `maintenanceType`, `harvesterId`, `search`, `sort`) |
| Perawatan | GET | `/api/maintenance-records/summary` | Ringkasan dashboard perawatan, rekap per jenis, blok sudah/belum dirawat, 6 aktivitas terbaru |
| Perawatan | POST | `/api/maintenance-records` | Tambah catatan perawatan (validasi & hitung `totalCost` di backend) |
| Perawatan | GET/PUT/DELETE | `/api/maintenance-records/:id` | Detail, ubah, & hapus catatan perawatan |
| Perawatan | GET | `/api/reports/maintenance` | Laporan perawatan (totals, `byType`, `byLocation`, `records`) |

### Struktur Service Layer yang Direkomendasikan

```text
services/
├── api.js
├── dashboard.service.js
├── locations.service.js
├── harvesters.service.js
├── harvest.service.js
├── maintenance.service.js
└── reports.service.js
```

Ketentuan:

- Semua request API dilakukan melalui service layer (saat ini melalui `client/src/services/api.js`).
- Base URL menggunakan environment variable `VITE_API_URL`.
- Loading state harus tersedia (`busy` / skeleton).
- Error handling harus konsisten (`400` validasi, `404` tidak ditemukan, `409` konflik FK/duplikat, `500` error server).
- Form menggunakan validasi sebelum request dan tetap mengandalkan validasi serta perhitungan `totalCost` dari backend.
- Setelah mutasi berhasil, data terkait (daftar, ringkasan dashboard, dan laporan) harus diperbarui.
- Jangan menampilkan data dummy ketika API gagal tanpa penanda yang jelas.

## 12. Performance & Accessibility

Target pengembangan:

- Layout tidak menyebabkan horizontal overflow.
- Optimasi rendering pada daftar data.
- Hindari animasi berat.
- Gunakan lazy loading untuk halaman dan gambar.
- Gunakan semantic HTML.
- Pastikan kontras warna memadai.
- Semua input memiliki label.
- Navigasi dapat digunakan melalui keyboard.
- Tombol dan elemen interaktif memiliki ukuran sentuh yang nyaman.
- Sediakan loading, error, empty, dan success states.

## 13. Folder Structure

### Struktur Aktif Saat Ini (`client/src/`)

```text
client/src/
├── components/
│   ├── common/          (Modal.jsx, PageHeading.jsx, StatCard.jsx)
│   ├── layout/          (Sidebar.jsx, Topbar.jsx)
│   ├── masters/         (MasterModal.jsx)
│   ├── maintenance/     (MaintenanceTable.jsx)
│   └── records/         (RecordModal.jsx, RecordTable.jsx)
├── constants/           (navigation.js)
├── hooks/               (useHarvestData.js, useMaintenanceData.js)
├── pages/
│   ├── DashboardPage.jsx
│   ├── RecordsPage.jsx
│   ├── MasterPage.jsx
│   ├── ReportsPage.jsx
│   ├── MaintenanceDashboardPage.jsx
│   ├── MaintenanceRecordsPage.jsx
│   ├── MaintenanceFormPage.jsx
│   ├── MaintenanceDetailPage.jsx
│   └── MaintenanceReportPage.jsx
├── services/            (api.js)
├── utils/               (csv.js, formatters.js)
├── App.jsx
├── main.jsx
└── styles.css
```

### Struktur Target Setelah Redesign

```text
client/
└── src/
    ├── assets/
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── dashboard/
    │   ├── harvest/
    │   ├── maintenance/
    │   └── reports/
    │
    ├── pages/
    │   ├── DashboardPage.jsx
    │   ├── MasterPage.jsx
    │   ├── RecordsPage.jsx
    │   ├── ReportsPage.jsx
    │   ├── MaintenanceDashboardPage.jsx
    │   ├── MaintenanceRecordsPage.jsx
    │   ├── MaintenanceFormPage.jsx
    │   ├── MaintenanceDetailPage.jsx
    │   └── MaintenanceReportPage.jsx
    │
    ├── hooks/
    │   ├── useHarvestData.js
    │   ├── useMaintenanceData.js
    │   ├── useTheme.js
    │   └── useMediaQuery.js
    │
    ├── services/
    ├── contexts/
    ├── lib/
    ├── styles/
    │   └── theme.css
    ├── App.jsx
    └── main.jsx
```

Struktur dapat disesuaikan dengan proyek yang sudah ada. Jangan memindahkan atau menghapus file yang masih digunakan tanpa memeriksa dependensinya.

## 14. Implementation Roadmap

Implementasi dilakukan secara bertahap.

### Phase 1 — Foundation

- Audit struktur frontend yang sudah ada.
- Periksa versi React dan Vite.
- Setup Tailwind CSS.
- Setup Motion.
- Setup shadcn/ui.
- Setup Lucide React.
- Setup React Router.
- Membuat design tokens.
- Membuat theme provider.

### Phase 2 — Layout & Responsive

- Implementasi desktop sidebar.
- Implementasi topbar.
- Implementasi mobile bottom navigation.
- Implementasi responsive page container.
- Implementasi light dan dark mode.
- Implementasi page transitions.

### Phase 3 — Core Dashboard

- Dashboard summary cards.
- Harvest chart.
- Maintenance chart.
- Recent activity.
- Loading dan empty states.
- Integrasi API.

### Phase 4 — Operational Pages

- Data Master (`Lokasi / Blok`, `Data Pemanen`).
- Catatan Panen & ekspor CSV.
- Perawatan Kebun (`Dashboard Perawatan`, `Daftar Perawatan`, `Tambah/Ubah Perawatan`, `Detail Perawatan`, `Laporan Perawatan` & ekspor CSV).
- Laporan Panen & Laporan Perawatan.
- Reusable CRUD forms dengan validasi dinamis per jenis perawatan.
- Responsive data tables & mobile card list.

### Phase 5 — Polish & Optimization

- Micro interactions.
- Skeleton loading.
- Error handling.
- Accessibility.
- Mobile optimization.
- Performance testing.
- Cross-browser testing.

### Phase 6 — PWA

- Web manifest.
- Service worker.
- Install prompt.
- Offline fallback.
- IndexedDB.
- Background synchronization dan conflict handling.

## 15. Development Rules

Ketika mengimplementasikan desain ini, developer atau AI coding agent harus mengikuti aturan:

1. Jangan membangun ulang aplikasi dari nol jika struktur yang ada masih layak digunakan.
2. Jangan menghapus fitur atau API yang sudah berfungsi.
3. Pertahankan integrasi dengan backend.
4. Gunakan reusable components.
5. Gunakan design tokens untuk konsistensi warna.
6. Pastikan setiap halaman responsif.
7. Prioritaskan pengalaman mobile.
8. Hindari hardcoded dummy data pada halaman produksi.
9. Gunakan animasi secara proporsional.
10. Pastikan Light Mode dan Dark Mode konsisten.
11. Jangan menambahkan library yang memiliki fungsi sama tanpa alasan teknis.
12. Lakukan pengujian setelah setiap fase implementasi.

## 16. Definition of Done

Pengembangan UI dianggap selesai apabila:

- Semua halaman menggunakan design system Botanical Modern.
- Desktop memiliki sidebar yang berfungsi.
- Mobile memiliki bottom navigation.
- Tablet memiliki layout adaptif.
- Light Mode dan Dark Mode berjalan.
- Animasi transisi berjalan dengan lancar.
- Seluruh komponen UI konsisten.
- Form dan tabel dapat digunakan pada layar kecil.
- Seluruh halaman terhubung dengan API yang sesuai (Panen, Data Master, dan Perawatan Kebun).
- Tidak ada fitur lama maupun modul Perawatan Kebun yang rusak.
- Perhitungan biaya perawatan tetap dikendalikan oleh backend dan data SQLite (`harvest_records` maupun `maintenance_records`) tetap aman.
- Tidak ada horizontal overflow yang tidak diinginkan.
- Loading, error, empty, dan success states tersedia.

## 17. Final Product Vision

Panenku dikembangkan sebagai modern agricultural management platform.

Identitas produk:

**PANENKU — Smart Plantation Management**

Karakter aplikasi:

- Botanical-inspired.
- Modern SaaS.
- Mobile-first.
- Responsive.
- Data-driven.
- Lightweight.
- Scalable.

Fokus utama bukan sekadar tampilan menarik, tetapi memberikan pengalaman pencatatan hasil panen dan perawatan kebun yang cepat, mudah, konsisten, dan dapat diandalkan pada desktop maupun perangkat mobile.

---

**Development Priority:** Foundation → Layout → Dashboard → Operational Pages → Reports → PWA.

**Important:** Lakukan audit kode dan dependensi sebelum memulai implementasi. Jangan mengganti backend atau database sebagai bagian dari pekerjaan redesign frontend ini.