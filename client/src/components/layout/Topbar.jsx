import { CalendarDays, Menu, Moon, RefreshCw, Sun } from 'lucide-react';
import { pageTitles } from '../../constants/navigation.js';
import { formatDate, today } from '../../utils/formatters.js';

export default function Topbar({
  page,
  theme = 'light',
  onToggleTheme,
  onOpenMobile,
  onRefresh,
}) {
  const currentLabel = pageTitles[page] || 'Dashboard';
  const isMaintenance = page.startsWith('maintenance-');

  return (
    <header className="topbar">
      <button
        className="icon-btn mobile-menu"
        onClick={onOpenMobile}
        title="Buka menu navigasi"
        type="button"
      >
        <Menu size={19} />
      </button>

      <div className="breadcrumb">
        PANENKU
        {isMaintenance && (
          <>
            <span>/</span> Perawatan Kebun
          </>
        )}
        <span>/</span> <b>{currentLabel}</b>
      </div>

      <div className="top-actions">
        <span className="today-label">
          <CalendarDays size={15} />
          {formatDate(today)}
        </span>
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
          type="button"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className="icon-btn" onClick={onRefresh} title="Muat ulang" type="button">
          <RefreshCw size={17} />
        </button>
        <div className="avatar">A</div>
      </div>
    </header>
  );
}
