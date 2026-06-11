import React, { useState, useEffect } from 'react';
import {
  Clock, FileText, User, ChevronDown, Save
} from 'lucide-react';
import type { MaintenanceRequest } from '../../types';

interface RequestCardProps {
  request: MaintenanceRequest;
  onStatusChange: (id: number, newStatus: string) => void;
  isAdmin?: boolean;
}

const statusClass: Record<string, string> = {
  'Beklemede':  'badge-pending',
  'Onaylandı':  'badge-approved',
  'Tamamlandı': 'badge-done',
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const RequestCard: React.FC<RequestCardProps> = ({ request, onStatusChange, isAdmin }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(request.status);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedStatus(request.status);
  }, [request.status]);

  const hasChanged = selectedStatus !== request.status;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onStatusChange(request.id, selectedStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="request-card">
      {/* Başlık */}
      <div className="request-card-header">
        <h3 className="request-title" style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>
          TLB-{request.id.toString().padStart(4, '0')}
        </h3>
        <span className={`badge ${statusClass[request.status] || 'badge-pending'}`}>
          {request.status}
        </span>
      </div>

      {/* Meta bilgiler */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <FileText size={13} style={{ color: 'var(--text-muted)' }} />
          <span>Rapor ID: {request.reportId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <User size={13} style={{ color: 'var(--text-muted)' }} />
          <span>Oluşturan: {request.createdById}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Clock size={13} />
          <span>{formatDate(request.createdDate)}</span>
        </div>
      </div>

      {/* Açıklama */}
      <div className="request-desc">
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, fontSize: '0.85rem' }}>
          Bakım Talebi Detayı
        </p>
        {request.requestText}
      </div>

      {/* Aksiyon Alanı — sadece Admin */}
      {isAdmin && (
        <div className="request-footer" style={{ borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingTop: 12, display: 'flex' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Durumu Güncelle:
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              className="inline-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setSaved(false);
              }}
            >
              <option value="Beklemede">Beklemede</option>
              <option value="Onaylandı">Onaylandı</option>
              <option value="Tamamlandı">Tamamlandı</option>
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>

          <button
            className={`btn btn-sm ${saved ? 'btn-success' : hasChanged ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleSave}
            disabled={(!hasChanged && !saved) || saving}
          >
            <Save size={13} />
            {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
