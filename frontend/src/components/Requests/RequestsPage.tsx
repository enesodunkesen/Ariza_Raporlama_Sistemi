// ============================================================
// RequestsPage — Bakım Talepleri Listesi (Gerçek API)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { MaintenanceRequest } from '../../types';
import { adminService } from '../../services/api';
import RequestCard from './RequestCard';

const statusTranslation: Record<string, string> = {
  'Pending': 'Beklemede',
  'InProgress': 'Onaylandı',
  'Completed': 'Tamamlandı',
  'Beklemede': 'Beklemede',
  'Onaylandı': 'Onaylandı',
  'Tamamlandı': 'Tamamlandı'
};

const backendStatusMap: Record<string, string> = {
  'Beklemede': 'Pending',
  'Onaylandı': 'InProgress',
  'Tamamlandı': 'Completed'
};

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Tümü');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API'den talepleri çek
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getRequests();
      if (res.isSuccess && res.data) {
        const mappedData = (res.data as any[]).map(r => ({
          ...r,
          status: statusTranslation[r.status] || r.status
        }));
        setRequests(mappedData as MaintenanceRequest[]);
      } else {
        setError(res.message || 'Talepler yüklenemedi.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Durum değiştirme handler'ı
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await adminService.updateRequestStatus(id, backendStatusMap[newStatus]);
      if (res.isSuccess) {
        // Lokalde güncelle
        setRequests((prev) =>
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

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const counts = {
    'Tümü':       requests.length,
    'Beklemede':  requests.filter((r) => r.status === 'Beklemede').length,
    'Onaylandı':  requests.filter((r) => r.status === 'Onaylandı').length,
    'Tamamlandı': requests.filter((r) => r.status === 'Tamamlandı').length,
  };

  const tabs = [
    { key: 'Tümü',       label: 'Tüm Talepler',   icon: <ClipboardList size={15} /> },
    { key: 'Beklemede',  label: 'Beklemede',       icon: <ClipboardList size={15} /> },
    { key: 'Onaylandı',  label: 'Onaylandı',       icon: <ClipboardList size={15} /> },
    { key: 'Tamamlandı', label: 'Tamamlandı',     icon: <ClipboardList size={15} /> },
  ];

  const filtered =
    activeTab === 'Tümü'
      ? requests
      : requests.filter((r) => r.status === activeTab);


  return (
    <div>
      {/* Sayfa Başlığı */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Bakım Talepleri</h1>
            <p>
              Bakım ve onarım taleplerini yönetin.
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={fetchRequests}
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
            <span className="tab-count">{counts[tab.key as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      {/* Talep Listesi */}
      {loading ? (
        <div className="empty-state">
          <Loader2 size={36} className="spin" />
          <p>Talepler yükleniyor...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <p>Bu kategoride talep bulunmuyor.</p>
        </div>
      ) : (
        <div className="requests-list">
          {filtered.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onStatusChange={handleStatusChange}
              isAdmin={true}
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

export default RequestsPage;
