import { Leaf, X } from 'lucide-react';
import { navItems } from '../../constants/navigation.js';

export default function Sidebar({
  page,
  mobileOpen,
  isOnline = true,
  onNavigate,
  onCloseMobile,
}) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">
          <Leaf size={21} />
        </div>
        <div>
          <b>PanenKu</b>
          <small>HARVEST MANAGEMENT</small>
        </div>
        <button className="icon-btn mobile-close" onClick={onCloseMobile}>
          <X />
        </button>
      </div>

      <div className="workspace-label">MENU UTAMA</div>

      <nav>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
            {page === item.id && <span className="nav-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div
          className="status-dot"
          style={isOnline ? undefined : { background: '#c45a4a', boxShadow: '0 0 0 3px #fdeeeb' }}
        />{' '}
        <span>{isOnline ? 'Database lokal aktif' : 'Koneksi API terputus'}</span>
        <span className="version">v1.0</span>
      </div>
    </aside>
  );
}
