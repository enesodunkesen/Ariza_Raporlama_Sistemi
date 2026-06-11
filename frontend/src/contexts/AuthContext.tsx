// ============================================================
// AuthContext — JWT Auth State Yönetimi
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authService,
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  type AuthUser,
} from '../services/api';

interface AuthContextValue {
  /** Giriş yapılmış mı? */
  isLoggedIn: boolean;
  /** Giriş yapan kullanıcı bilgileri */
  user: AuthUser | null;
  /** Kullanıcı rolü */
  role: string | null;
  /** Loading durumu */
  loading: boolean;
  /** Hata mesajı */
  error: string | null;
  /** Giriş yap */
  login: (userName: string, password: string) => Promise<boolean>;
  /** Çıkış yap */
  logout: () => void;
  /** Hata temizle */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sayfa yüklendiğinde localStorage'dan oturum bilgisini oku
  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      // Token süresi kontrol
      const exp = new Date(storedUser.expiration);
      if (exp > new Date() && storedUser.role === 'Admin') {
        setUser(storedUser);
      } else {
        // Token süresi dolmuş veya admin değil, temizle
        removeToken();
        removeStoredUser();
      }
    }
  }, []);

  const login = useCallback(async (userName: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(userName, password);
      if (res.isSuccess && res.data) {
        // Sadece Admin rolü giriş yapabilir
        if (res.data.role !== 'Admin') {
          setError('Bu panele yalnızca yönetici (Admin) hesaplarıyla giriş yapılabilir.');
          setLoading(false);
          return false;
        }
        setToken(res.data.token);
        setStoredUser(res.data);
        setUser(res.data);
        setLoading(false);
        return true;
      } else {
        setError(res.message || 'Giriş başarısız.');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası.');
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isLoggedIn = !!user;
  const role = user?.role ?? null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, role, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
