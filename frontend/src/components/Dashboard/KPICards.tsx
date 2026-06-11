// ============================================================
// KPICards — Dashboard Metrik Kartları (Gerçek API + Mock MTTR)
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, BarChart2, TrendingUp, AlertTriangle, Loader2, ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService, reportService } from '../../services/api';
import type { AdminDashboardStatsDto, UserDashboardStatsDto } from '../../services/api';

const KPICards: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'Admin';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<AdminDashboardStatsDto | null>(null);
  const [userStats, setUserStats] = useState<UserDashboardStatsDto | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isAdmin) {
          const res = await adminService.getDashboardStats();
          if (res.isSuccess && res.data) {
            setAdminStats(res.data);
          } else {
            setError(res.message || 'İstatistikler yüklenemedi.');
          }
        } else {
          const res = await reportService.getDashboardStats();
          if (res.isSuccess && res.data) {
            setUserStats(res.data);
          } else {
            setError(res.message || 'İstatistikler yüklenemedi.');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bağlantı hatası.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  // Admin kartları
  const adminCards = adminStats ? [
    {
      label: 'Toplam Rapor',
      value: adminStats.totalReports,
      sub: 'Tüm zamanlar',
      color: 'blue',
      icon: <BarChart2 size={18} />,
    },
    {
      label: 'Beklemede',
      value: adminStats.pendingCount,
      sub: 'Çözüm bekleyen',
      color: 'amber',
      icon: <Clock size={18} />,
    },
    {
      label: 'İşleme Alındı',
      value: adminStats.inProgressCount,
      sub: 'Devam eden',
      color: 'blue',
      icon: <TrendingUp size={18} />,
    },
    {
      label: 'Tamamlandı',
      value: adminStats.resolvedCount,
      sub: 'Çözülmüş',
      color: 'green',
      icon: <CheckCircle2 size={18} />,
    },
    {
      label: 'Bugün Bildirilen',
      value: adminStats.todayCount,
      sub: 'Günlük',
      color: 'purple',
      icon: <AlertTriangle size={18} />,
    },
    {
      label: 'Bakım Talepleri',
      value: adminStats.totalMaintenanceRequests,
      sub: 'Toplam',
      color: 'blue',
      icon: <ClipboardList size={18} />,
    },
  ] : [];

  // User kartları
  const userCards = userStats ? [
    {
      label: 'Toplam Raporlarım',
      value: userStats.totalCount,
      sub: 'Tüm zamanlar',
      color: 'blue',
      icon: <BarChart2 size={18} />,
    },
    {
      label: 'Bugün',
      value: userStats.todayCount,
      sub: 'Günlük bildirim',
      color: 'purple',
      icon: <AlertTriangle size={18} />,
    },
    {
      label: 'Haftalık',
      value: userStats.weeklyCount,
      sub: 'Son 7 gün',
      color: 'amber',
      icon: <Clock size={18} />,
    },
    {
      label: 'Beklemede',
      value: userStats.pendingCount,
      sub: 'Çözüm bekleyen',
      color: 'amber',
      icon: <Clock size={18} />,
    },
    {
      label: 'İşleme Alındı',
      value: userStats.inProgressCount,
      sub: 'Devam eden',
      color: 'blue',
      icon: <TrendingUp size={18} />,
    },
    {
      label: 'Tamamlandı',
      value: userStats.completedCount,
      sub: 'Çözülmüş',
      color: 'green',
      icon: <CheckCircle2 size={18} />,
    },
  ] : [];

  const cards = isAdmin ? adminCards : userCards;

  if (loading) {
    return (
      <div className="kpi-grid">
        <div style={{
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: 40,
          color: 'var(--text-muted)',
        }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 8, fontSize: '0.82rem' }}>İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kpi-grid">
        <div style={{
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: 40,
          color: '#f85149',
          fontSize: '0.82rem',
        }}>
          <AlertTriangle size={24} />
          <p style={{ marginTop: 8 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Ana KPI Kartları */}
      <div className="kpi-grid">
        {cards.map((c) => (
          <div key={c.label} className={`kpi-card ${c.color}`}>
            <div className={`kpi-icon ${c.color}`}>{c.icon}</div>
            <div className="kpi-value">{c.value}</div>
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-sub">{c.sub}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default KPICards;
