// ============================================================
// Login Sayfası — Kimlik Doğrulama Ekranı (Gerçek API)
// ============================================================

import React, { useState } from 'react';
import { Eye, EyeOff, Factory, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login, loading, error, clearError } = useAuth();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ userName?: string; password?: string }>({});

  // Client-side validasyon
  const validate = (): boolean => {
    const newErrors: { userName?: string; password?: string } = {};
    if (!userName.trim()) {
      newErrors.userName = 'Kullanıcı adı boş bırakılamaz.';
    }
    if (!password.trim()) {
      newErrors.password = 'Şifre boş bırakılamaz.';
    } else if (password.length < 4) {
      newErrors.password = 'Şifre en az 4 karakter olmalıdır.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    clearError();
    await login(userName, password);
  };

  return (
    <div className="login-page">
      {/* Arka plan dekoratif öğeler */}
      <div className="login-bg-pattern" />
      <div className="login-grid-lines" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Factory size={26} color="#fff" />
          </div>
          <div className="login-logo-text">
            <h2>Arıza Rapor Sistem Paneli</h2>
          </div>
        </div>

        <h1 className="login-title">Hoş Geldiniz</h1>
        <p className="login-subtitle">
          Yönetim paneline erişmek için kimlik bilgilerinizi girin.
        </p>

        {/* Backend hata mesajı */}
        {error && (
          <div style={{
            background: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid rgba(248, 81, 73, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
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

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Kullanıcı Adı */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Kullanıcı Adı
            </label>
            <input
              id="login-email"
              type="text"
              className={`form-input ${errors.userName ? 'error' : ''}`}
              placeholder="Kullanıcı adınızı girin"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (errors.userName) setErrors((prev) => ({ ...prev, userName: undefined }));
              }}
              autoComplete="username"
            />
            {errors.userName && (
              <span className="form-error">
                <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                {errors.userName}
              </span>
            )}
          </div>

          {/* Şifre */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Şifre
            </label>
            <div className="password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">
                <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                {errors.password}
              </span>
            )}
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block',
                  }}
                />
                Giriş yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>


      </div>

      {/* Spinner keyframe — inline style ile eklendi */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
