import { Leaf, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from 'lucide-react';
import { navSections } from '../../constants/navigation.js';

export default function Sidebar({
  page,
  mobileOpen,
  collapsed = false,
  isOnline = true,
  theme = 'light',
  onToggleTheme,
  onToggleCollapse,
  onNavigate,
  onCloseMobile,
}) {
  return (
    <aside
      className={`sidebar ${mobileOpen ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}
    >
      <div className="brand">
        <div className="brand-mark">
          <Leaf size={21} />
        </div>
        <div className="brand-text">
          <b>PanenKu</b>
          <small>PLANTATION MANAGEMENT</small>
        </div>
        <button
          className="icon-btn collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          type="button"
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
        <button
          className="icon-btn mobile-close"
          onClick={onCloseMobile}
          title="Tutup menu"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-scroll">
        {navSections.map((section) => (
          <div className="nav-section" key={section.title}>
            <div className="workspace-label">{section.title}</div>
            <nav>
              {section.items.map((item) => {
                const isActive =
                  page === item.id ||
                  (page === 'maintenance-detail' && item.id === 'maintenance-records');
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <item.icon size={18} />
                    <span className="nav-label">{item.label}</span>
                    {isActive && <span className="nav-dot" />}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          className="theme-row-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Aktifkan Light Mode' : 'Aktifkan Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span className="nav-label">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <div className="sidebar-bottom">
          <div className={`status-dot ${isOnline ? '' : 'offline'}`} />
          <span className="status-text">
            {isOnline ? 'Database lokal aktif' : 'Koneksi API terputus'}
          </span>
          <span className="version">v1.1</span>
        </div>
      </div>
    </aside>
  );
}
