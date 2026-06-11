// ============================================================
// ReportCard — Tekil Arıza Raporu Kartı (Backend DTO uyumlu)
// ============================================================

import React, { useState } from 'react';
import {
  User, Clock, ChevronDown, Save, Tag, Hash, FileImage, AlertTriangle, X, Trash2
} from 'lucide-react';
import type { FaultReport, ReportStatus } from '../../types';

interface ReportCardProps {
  report: FaultReport;
  onStatusChange: (id: number, newStatus: ReportStatus) => void;
  onDelete: (id: number) => Promise<boolean>;
  isAdmin: boolean;
}

// Durum badge sınıfı
const statusClass: Record<string, string> = {
  'Beklemede':    'badge-pending',
  'İşleme Alındı': 'badge-inprog',
  'Tamamlandı':   'badge-done',
};

// Geçen süreyi Türkçe hesapla
const getElapsed = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return `${Math.floor(diff / 60000)} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return `${Math.floor(days / 30)} ay önce`;
};

// Tarih formatlama
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const ReportCard: React.FC<ReportCardProps> = ({ report, onStatusChange, onDelete, isAdmin }) => {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(report.status);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const hasChanged = selectedStatus !== report.status;

  const handleSave = async () => {
    setSaving(true);
    await onStatusChange(report.id, selectedStatus);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const success = await onDelete(report.id);
    setDeleting(false);
    if (success) {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="report-card">
      {/* Kart Başlığı */}
      <div className="report-card-header">
        <div className="report-id-row">
          <span className="report-id">RPT-{report.id.toString().padStart(4, '0')}</span>
        </div>
        <span className={`badge ${statusClass[report.status] || 'badge-pending'}`}>{report.status}</span>
      </div>

      {/* Meta Alanlar */}
      <div className="report-meta-grid">
        <div className="report-meta-item">
          <span className="report-meta-label">
            <User size={10} style={{ display: 'inline', marginRight: 4 }} />
            Kullanıcı ID
          </span>
          <span className="report-meta-value">{report.userId}</span>
        </div>

        {report.bandNumber && (
          <div className="report-meta-item">
            <span className="report-meta-label">
              <Tag size={10} style={{ display: 'inline', marginRight: 4 }} />
              Bant No
            </span>
            <span className="report-meta-value">{report.bandNumber}</span>
          </div>
        )}

        {report.productCode && (
          <div className="report-meta-item">
            <span className="report-meta-label">
              <Hash size={10} style={{ display: 'inline', marginRight: 4 }} />
              Ürün Kodu
            </span>
            <span className="report-meta-value" style={{ fontFamily: 'monospace' }}>
              {report.productCode}
            </span>
          </div>
        )}

        {report.errorCode && (
          <div className="report-meta-item">
            <span className="report-meta-label">
              <Hash size={10} style={{ display: 'inline', marginRight: 4 }} />
              Hata Kodu
            </span>
            <span className="report-meta-value" style={{ fontFamily: 'monospace', color: 'var(--red)' }}>
              {report.errorCode}
            </span>
          </div>
        )}

        <div className="report-meta-item">
          <span className="report-meta-label">
            <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />
            Oluşturulma
          </span>
          <span className="report-meta-value">{formatDate(report.createdDate)}</span>
        </div>

        <div className="report-meta-item">
          <span className="report-meta-label">Geçen Süre</span>
          <span className="report-meta-value" style={{ color: 'var(--amber-bright)' }}>
            {getElapsed(report.createdDate)}
          </span>
        </div>
      </div>

      {/* Fotoğraf */}
      {report.imagePath && (
        <div style={{ marginBottom: 10 }}>
          <div className="report-meta-label" style={{ marginBottom: 4 }}>
            <FileImage size={10} style={{ display: 'inline', marginRight: 4 }} />
            Ek Fotoğraf
          </div>
          <img
            src={report.imagePath}
            alt="Arıza fotoğrafı"
            style={{
              maxWidth: '100%',
              maxHeight: 200,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              objectFit: 'cover',
              cursor: 'zoom-in',
            }}
            onClick={() => setSelectedImage(report.imagePath!)}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Açıklama */}
      <div className="report-description">{report.description}</div>

      {/* Aksiyon Alanı — sadece Admin */}
      {isAdmin && (
        <div className="report-actions">
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Durumu Güncelle:
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              className="inline-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as ReportStatus);
                setSaved(false);
              }}
            >
              <option value="Beklemede">Beklemede</option>
              <option value="İşleme Alındı">İşleme Alındı</option>
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

          <button
            className="btn btn-sm btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            title="Arıza raporunu sil"
          >
            <Trash2 size={13} />
            Sil
          </button>

          <div className="report-time">
            <Clock size={12} />
            <span>Oluşturulma: {getElapsed(report.createdDate)}</span>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div className="modal-box modal-sm">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--red-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}>
                  <AlertTriangle size={18} />
                </div>
                <h2>Raporu Sil</h2>
              </div>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Rapor <strong>RPT-{report.id.toString().padStart(4, '0')}</strong> ve buna bağlı tüm bakım talepleri kalıcı olarak silinecektir.
            </p>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
              Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?
            </p>

            <div className="modal-footer" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                İptal
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resim Büyütme Modalı */}
      {selectedImage && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedImage(null)}
          style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out' }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute', top: -35, right: 0,
                background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={28} />
            </button>
            <img 
              src={selectedImage} 
              alt="Büyütülmüş fotoğraf" 
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
