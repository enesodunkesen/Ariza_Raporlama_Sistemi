// ============================================================
// DeleteConfirmModal — Kullanıcı Silme Onay Modalı
// ============================================================

import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import type { User } from '../../types';

interface DeleteConfirmModalProps {
  user: User;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  user,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        {/* Başlık */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'var(--red-dim)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--red)',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h2>Kullanıcıyı Sil</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* İçerik */}
        <div
          style={{
            background: 'var(--red-dim)', border: '1px solid rgba(248,81,73,0.2)',
            borderRadius: 'var(--radius-md)', padding: '16px',
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 8 }}>
            Aşağıdaki kullanıcı kalıcı olarak silinecektir:
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--red), #ff7b72)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 700, color: '#fff',
                flexShrink: 0,
              }}
            >
              {user.name[0]}{user.surname[0]}
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.name} {user.surname}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {user.employeeId} · {user.role} · Hat {user.lineNumber}
              </p>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
          Bu işlem <strong style={{ color: 'var(--red)' }}>geri alınamaz</strong>. Devam etmek
          istediğinizden emin misiniz?
        </p>

        {/* Butonlar */}
        <div className="modal-footer" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            İptal
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <Trash2 size={15} />
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
