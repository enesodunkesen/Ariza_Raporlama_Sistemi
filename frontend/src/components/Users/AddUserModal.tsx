// ============================================================
// AddUserModal — Yeni Kullanıcı Ekleme Modalı
// ============================================================

import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import type { UserRole } from '../../types';

interface AddUserModalProps {
  onClose: () => void;
  onAdd: (userData: any) => Promise<boolean>;
}

interface FormData {
  userName: string;
  password: string;
  lineNumber: string;
  role: UserRole;
}

interface FormErrors {
  userName?: string;
  password?: string;
  lineNumber?: string;
}

const ROLES: UserRole[] = ['İşçi', 'Şef', 'Admin'];

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAdd }) => {
  const [form, setForm] = useState<FormData>({
    userName: '',
    password: '',
    lineNumber: '',
    role: 'İşçi',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const setField = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  // Validasyon
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.userName.trim())   newErrors.userName = 'Kullanıcı adı zorunludur.';
    
    if (!form.password)          newErrors.password = 'Şifre zorunludur.';
    else if (form.password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalıdır.';

    if (!form.lineNumber.trim()) newErrors.lineNumber = 'Bant numarası/adı zorunludur.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError(null);
    try {
      const generatedEmail = `${form.userName.trim().toLowerCase()}@fabrika.com`;
      const success = await onAdd({
        userName: form.userName.trim(),
        email: generatedEmail,
        password: form.password,
        bandNumber: form.lineNumber,
        role: form.role
      });
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Kullanıcı eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg: React.FC<{ msg?: string }> = ({ msg }) =>
    msg ? (
      <span className="form-error">
        <AlertCircle size={11} style={{ display: 'inline', marginRight: 3 }} />
        {msg}
      </span>
    ) : null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Başlık */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'var(--blue-dim)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--blue-accent)',
              }}
            >
              <UserPlus size={18} />
            </div>
            <h2>Yeni Kullanıcı Ekle</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        {generalError && (
          <div style={{
            background: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid rgba(248, 81, 73, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: 14,
            fontSize: '0.8rem',
            color: '#f85149',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={14} />
            {generalError}
          </div>
        )}

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          {/* Kullanıcı Adı */}
          <div className="form-group">
            <label className="form-label" htmlFor="add-username">Kullanıcı Adı</label>
            <input
              id="add-username"
              type="text"
              className={`form-input ${errors.userName ? 'error' : ''}`}
              placeholder="mehmet_yilmaz"
              value={form.userName}
              onChange={(e) => setField('userName', e.target.value)}
              disabled={loading}
            />
            <ErrorMsg msg={errors.userName} />
          </div>

          {/* Şifre */}
          <div className="form-group">
            <label className="form-label" htmlFor="add-password">Şifre</label>
            <input
              id="add-password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="******"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              disabled={loading}
            />
            <ErrorMsg msg={errors.password} />
          </div>

          {/* Bant No */}
          <div className="form-group">
            <label className="form-label" htmlFor="add-line">Bant No</label>
            <input
              id="add-line"
              type="text"
              className={`form-input ${errors.lineNumber ? 'error' : ''}`}
              placeholder="Hat 1"
              value={form.lineNumber}
              onChange={(e) => setField('lineNumber', e.target.value)}
              disabled={loading}
            />
            <ErrorMsg msg={errors.lineNumber} />
          </div>

          {/* Rol */}
          <div className="form-group">
            <label className="form-label" htmlFor="add-role">Sistem Rolü</label>
            <select
              id="add-role"
              className="form-select"
              value={form.role}
              onChange={(e) => setField('role', e.target.value as UserRole)}
              disabled={loading}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Butonlar */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <UserPlus size={15} />
              {loading ? 'Ekleniyor...' : 'Kullanıcı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
