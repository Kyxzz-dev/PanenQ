import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  Users,
  ChartNoAxesCombined,
  Sprout,
  ListChecks,
  FilePlus2,
  FileBarChart2,
} from 'lucide-react';

export const navSections = [
  {
    title: 'RINGKASAN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'DATA MASTER',
    items: [
      { id: 'locations', label: 'Lokasi / Blok', icon: MapPinned },
      { id: 'harvesters', label: 'Data Pemanen', icon: Users },
    ],
  },
  {
    title: 'PERAWATAN KEBUN',
    items: [
      { id: 'maintenance-dashboard', label: 'Dashboard Perawatan', icon: Sprout },
      { id: 'maintenance-records', label: 'Daftar Perawatan', icon: ListChecks },
      { id: 'maintenance-form', label: 'Tambah Perawatan', icon: FilePlus2 },
      { id: 'maintenance-reports', label: 'Laporan Perawatan', icon: FileBarChart2 },
    ],
  },
  {
    title: 'PANEN',
    items: [
      { id: 'records', label: 'Catatan Panen', icon: ClipboardList },
      { id: 'reports', label: 'Laporan Panen', icon: ChartNoAxesCombined },
    ],
  },
  {
    title: 'PREFERENSI',
    items: [
      { id: 'profile', label: 'Profil Pengguna', icon: Users },
    ],
  },
];

export const navItems = navSections.flatMap((section) => section.items);

export const pageTitles = {
  ...Object.fromEntries(navItems.map((item) => [item.id, item.label])),
  'maintenance-detail': 'Detail Perawatan',
  'location-detail': 'Detail Lokasi / Batas GeoJSON',
};
