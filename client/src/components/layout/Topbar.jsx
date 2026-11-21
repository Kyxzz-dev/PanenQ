import { CalendarDays, Menu, RefreshCw } from 'lucide-react';
import { navItems } from '../../constants/navigation.js';
import { formatDate, today } from '../../utils/formatters.js';

export default function Topbar({ page, onOpenMobile, onRefresh }) {
  const currentPage = navItems.find((item) => item.id === page);

  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu" onClick={onOpenMobile}>
        <Menu />
      </button>

      <div className="breadcrumb">
        Workspace <span>/</span> <b>{currentPage?.label}</b>
      </div>

      <div className="top-actions">
        <span className="today-label">
          <CalendarDays size={15} />
          {formatDate(today)}
        </span>
        <button className="icon-btn" onClick={onRefresh} title="Muat ulang">
          <RefreshCw size={17} />
        </button>
        <div className="avatar">A</div>
      </div>
    </header>
  );
}
