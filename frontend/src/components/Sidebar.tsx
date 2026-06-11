// ============================================================
// Sidebar — Sol Sabit Navigasyon Menüsü
// ============================================================

import React from 'react';
import {
  BarChart2,
  FileText,
  ClipboardList,
  Users,
  LogOut,
  Factory,
} from 'lucide-react';
import type { PageKey } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
  role: string | null;
}

// Navigasyon öğeleri tanımlaması
const allNavItems: { key: PageKey; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  {
    key: 'dashboard',
    label: 'Performans Grafikleri',
    icon: <BarChart2 size={18} />,
  },
  {
    key: 'reports',
    label: 'Raporlar',
    icon: <FileText size={18} />,
  },
  {
    key: 'requests',
    label: 'Talepler',
    icon: <ClipboardList size={18} />,
    adminOnly: true,
  },
  {
    key: 'users',
    label: 'Kullanıcı İşlemleri',
    icon: <Users size={18} />,
    adminOnly: true,
  },
];

// Sayfa başlıkları (top header için)
export const pageTitles: Record<PageKey, string> = {
  dashboard: 'Performans Grafikleri',
  reports: 'Arıza Raporları',
  requests: 'Admin Talepleri',
  users: 'Kullanıcı İşlemleri',
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout, role }) => {
  const { user } = useAuth();

  const isAdmin = role === 'Admin';

  // Admin olmayan kullanıcılar sadece admin olmayan sayfaları görebilir
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="sidebar">
      {/* Logo / Sistem Adı */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <div className="logo-icon-box">
            <Factory size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {user?.userName ?? 'Kullanıcı'}
            </p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{role ?? 'Kullanıcı'}</p>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: isAdmin
              ? 'linear-gradient(135deg, #1f6feb, #388bfd)'
              : 'linear-gradient(135deg, #3fb950, #56d364)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user?.userName?.slice(0, 2).toUpperCase() ?? 'KL'}
          </div>
        </div>
      </div>

      {/* Navigasyon Linkleri */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${activePage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Çıkış Butonu — en alt */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
