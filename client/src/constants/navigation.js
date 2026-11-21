import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  Users,
  ChartNoAxesCombined,
} from 'lucide-react';

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'records', label: 'Catatan Panen', icon: ClipboardList },
  { id: 'locations', label: 'Lokasi / Blok', icon: MapPinned },
  { id: 'harvesters', label: 'Data Pemanen', icon: Users },
  { id: 'reports', label: 'Laporan', icon: ChartNoAxesCombined },
];
