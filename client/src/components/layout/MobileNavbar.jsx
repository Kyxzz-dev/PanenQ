import {
  ChartNoAxesCombined,
  ClipboardList,
  Home,
  Sprout,
  UserCircle,
} from 'lucide-react';

export default function MobileNavbar({ page, onNavigate }) {
  const isMaintenance = page.startsWith('maintenance-');
  const isReports = page === 'reports' || page === 'maintenance-reports';

  const items = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      active: page === 'dashboard',
      onClick: () => onNavigate('dashboard'),
    },
    {
      id: 'records',
      label: 'Panen',
      icon: ClipboardList,
      active: page === 'records',
      onClick: () => onNavigate('records'),
    },
    {
      id: 'maintenance-dashboard',
      label: 'Perawatan',
      icon: Sprout,
      active: isMaintenance && page !== 'maintenance-reports',
      onClick: () => onNavigate('maintenance-dashboard'),
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: ChartNoAxesCombined,
      active: isReports,
      onClick: () => onNavigate(isMaintenance ? 'maintenance-reports' : 'reports'),
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: UserCircle,
      active: page === 'profile',
      onClick: () => onNavigate('profile'),
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigasi utama mobile">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mobile-nav-item ${item.active ? 'active' : ''}`}
          onClick={item.onClick}
        >
          <span className="mobile-nav-icon">
            <item.icon size={19} />
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
