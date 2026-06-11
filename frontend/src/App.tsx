// ============================================================
// App.tsx — Ana Uygulama: Auth State + Routing + Layout
// ============================================================

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Clock } from 'lucide-react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import ReportsPage from './components/Reports/ReportsPage';
import RequestsPage from './components/Requests/RequestsPage';
import UsersPage from './components/Users/UsersPage';

import type { PageKey } from './types';
import './index.css';

// Şu anki Türkçe tarih/saat
const getNowString = (): string => {
  return new Date().toLocaleString('tr-TR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AppContent: React.FC = () => {
  const { isLoggedIn, logout, role } = useAuth();

  // Aktif sayfa
  const [activePage, setActivePage] = useState<PageKey>('dashboard');

  // Tema state'i (dark varsayılan)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Tema değişince document root'a uygula
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Çıkış işlemi
  const handleLogout = () => {
    logout();
    setActivePage('dashboard');
  };

  // Login ekranı
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // Sayfa içeriğini render et
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />;
      case 'reports':   return <ReportsPage />;
      case 'requests':  return <RequestsPage />;
      case 'users':     return <UsersPage />;
      default:          return <DashboardPage />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sol Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        onLogout={handleLogout}
        role={role}
      />

      {/* Ana İçerik */}
      <main className="app-main">
        {/* Üst Header */}
        <header className="top-header">
          <h2 className="top-header-title">Arıza Rapor Sistemi Paneli</h2>
          <div className="top-header-meta">
            {/* Saat */}
            <div className="header-badge">
              <Clock size={13} />
              <span>{getNowString()}</span>
            </div>

            {/* Tema Toggle — Güneş / Ay */}
            <div className="theme-toggle-group" title="Tema Seç">
              <button
                className={`theme-btn ${theme === 'light' ? 'active-light' : ''}`}
                onClick={() => setTheme('light')}
                title="Açık Tema"
                aria-label="Açık temaya geç"
              >
                <Sun size={15} />
              </button>
              <button
                className={`theme-btn ${theme === 'dark' ? 'active-dark' : ''}`}
                onClick={() => setTheme('dark')}
                title="Karanlık Tema"
                aria-label="Karanlık temaya geç"
              >
                <Moon size={15} />
              </button>
            </div>



            {/* Online indicator */}
            <div className="header-badge">
              <div className="status-dot" />
              <span>Sistem Aktif</span>
            </div>
          </div>
        </header>

        {/* Sayfa İçeriği — smooth fade */}
        <div
          className="page-content"
          key={activePage}
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
