// ============================================================
// ReportsPage — Sekmeli Arıza Raporu Listesi (Gerçek API)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { FaultReport, ReportStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { adminService, reportService } from '../../services/api';
import ReportCard from './ReportCard';

const statusTranslation: Record<string, ReportStatus> = {
  'Pending': 'Beklemede',
  'InProgress': 'İşleme Alındı',
  'Resolved': 'Tamamlandı',
  'Beklemede': 'Beklemede',
  'İşleme Alındı': 'İşleme Alındı',
  'Tamamlandı': 'Tamamlandı'
};

const backendStatusMap: Record<ReportStatus, string> = {
  'Beklemede': 'Pending',
  'İşleme Alındı': 'InProgress',
  'Tamamlandı': 'Resolved'
};

const ReportsPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'Admin';

  const [reports, setReports] = useState<FaultReport[]>([]);
  const [activeTab, setActiveTab] = useState<ReportStatus>('Beklemede');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API'den raporları çek
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = isAdmin
        ? await adminService.getReports()
        : await reportService.getMyReports();

      if (res.isSuccess && res.data) {
        const mappedData = (res.data as any[]).map(r => ({
          ...r,
          status: statusTranslation[r.status] || r.status
        }));
        setReports(mappedData as FaultReport[]);
      } else {
        setError(res.message || 'Raporlar yüklenemedi.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Durum değiştirme handler'ı
  const handleStatusChange = async (id: number, newStatus: ReportStatus) => {
    if (!isAdmin) return;
    try {
      const res = await adminService.updateReportStatus(id, backendStatusMap[newStatus]);
      if (res.isSuccess) {
        // Lokalde güncelle
        setReports((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: newStatus } : r
          )
        );
      } else {
        alert(res.message || 'Durum güncellenemedi.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bağlantı hatası.');
    }
  };

  // Rapor silme handler'ı
  const handleDeleteReport = async (id: number): Promise<boolean> => {
    try {
      const res = await adminService.deleteReport(id);
      if (res.isSuccess) {
        setReports(prev => prev.filter(r => r.id !== id));
        return true;
      } else {
        alert(res.message || 'Rapor silinemedi.');
        return false;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bağlantı hatası.');
      return false;
    }
  };

  // Sekmelere göre filtrele
  const filtered = reports.filter((r) => r.status === activeTab);

  const counts = {
    'Beklemede':     reports.filter((r) => r.status === 'Beklemede').length,
    'İşleme Alındı': reports.filter((r) => r.status === 'İşleme Alındı').length,
    'Tamamlandı':    reports.filter((r) => r.status === 'Tamamlandı').length,
  };

  const tabs: { key: ReportStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'Beklemede',      label: 'Beklemede',      icon: <Clock size={15} /> },
    { key: 'İşleme Alındı', label: 'İşleme Alındı',  icon: <Loader2 size={15} /> },
    { key: 'Tamamlandı',    label: 'Tamamlandı',     icon: <CheckCircle2 size={15} /> },
  ];


  return (
    <div>
      {/* Sayfa Başlığı */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Arıza Raporları</h1>
            <p>{isAdmin ? 'Tüm arıza bildirimlerini yönetin.' : 'Kendi arıza bildirimlerinizi görüntüleyin.'}</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={fetchReports}
            disabled={loading}
            title="Yenile"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Yenile
          </button>
        </div>
      </div>

      {/* Hata */}
      {error && (
        <div style={{
          background: 'rgba(248, 81, 73, 0.1)',
          border: '1px solid rgba(248, 81, 73, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 16,
          fontSize: '0.82rem',
          color: '#f85149',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Tab Barı */}
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
            <span className="tab-count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* Rapor Listesi */}
      {loading ? (
        <div className="empty-state">
          <Loader2 size={36} className="spin" />
          <p>Raporlar yükleniyor...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <p>Bu sekmede rapor bulunmuyor.</p>
        </div>
      ) : (
        <div className="reports-list">
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteReport}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
