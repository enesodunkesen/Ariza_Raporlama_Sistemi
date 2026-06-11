// ============================================================
// UsersPage — Kullanıcı Yönetimi CRUD Arayüzü
// Gerçek API verisi kullanır
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserPlus, Search, Trash2, Shield, Users,
  ChevronDown, CheckCircle2, RefreshCw, Loader2, AlertCircle
} from 'lucide-react';
import type { User, UserRole } from '../../types';
import { adminService } from '../../services/api';
import type { AdminUserDto } from '../../services/api';
import AddUserModal from './AddUserModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const ROLES: UserRole[] = ['İşçi', 'Şef', 'Admin'];

const roleClass: Record<UserRole, string> = {
  'İşçi':  'badge-low',
  'Şef':   'badge-progress',
  'Admin': 'badge-done',
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [savedRows, setSavedRows] = useState<Set<string>>(new Set());
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set());

  // API'den kullanıcıları çek
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers();
      if (res.isSuccess && res.data) {
        const mappedUsers = res.data.map((dto: AdminUserDto) => ({
          id: dto.id,
          employeeId: dto.userName,
          name: dto.userName,
          surname: '',
          email: dto.email,
          lineNumber: dto.bandNumber || '',
          role: dto.role as UserRole,
          department: dto.role === 'Admin' ? 'Yönetim' : dto.role === 'Şef' ? 'Üretim Yönetimi' : 'Üretim',
          createdAt: new Date().toISOString()
        }));
        setUsers(mappedUsers);
      } else {
        setError(res.message || 'Kullanıcılar yüklenemedi.');
      }
    } catch (err: any) {
      setError(err.message || 'Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Arama filtresi
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.surname.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Rol güncelleme (lokal state)
  const handleRoleChange = (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  // Bant No güncelleme (lokal state)
  const handleLineChange = (id: string, line: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, lineNumber: line } : u)));
  };

  // Satır kaydetme (API çağrısı)
  const handleSaveRow = async (id: string) => {
    const userToSave = users.find(u => u.id === id);
    if (!userToSave) return;

    setSavingRows(prev => new Set(prev).add(id));
    try {
      const res = await adminService.updateUser(id, {
        bandNumber: userToSave.lineNumber.toString(),
        role: userToSave.role
      });
      if (res.isSuccess) {
        setSavedRows((prev) => new Set(prev).add(id));
        setTimeout(() => {
          setSavedRows((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 2000);
      } else {
        alert(res.message || 'Kullanıcı güncellenemedi.');
      }
    } catch (err: any) {
      alert(err.message || 'Bir hata oluştu.');
    } finally {
      setSavingRows(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Kullanıcı ekleme (API çağrısı modal üzerinden çağrılır)
  const handleAddUser = async (userData: any): Promise<boolean> => {
    try {
      const res = await adminService.createUser(userData);
      if (res.isSuccess) {
        fetchUsers(); // Listeyi yenile
        return true;
      } else {
        alert(res.message || 'Kullanıcı eklenemedi.');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'Bir hata oluştu.');
      return false;
    }
  };

  // Kullanıcı silme (API çağrısı)
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminService.deleteUser(deleteTarget.id);
      if (res.isSuccess) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert(res.message || 'Kullanıcı silinemedi.');
      }
    } catch (err: any) {
      alert(err.message || 'Bir hata oluştu.');
    }
  };

  // İstatistik sayaçları
  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'Admin').length,
    chiefs: users.filter((u) => u.role === 'Şef').length,
    workers: users.filter((u) => u.role === 'İşçi').length,
  };

  return (
    <div>
      {/* Sayfa Başlığı */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Kullanıcı İşlemleri</h1>
            <p>Fabrika personelini görüntüleyin, rol ve bant atamalarını yönetin.</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={fetchUsers}
            disabled={loading}
            title="Yenile"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Yenile
          </button>
        </div>
      </div>

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

      {/* Özet Kartları */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Toplam Kullanıcı', value: stats.total,   color: 'blue',   icon: <Users size={16} /> },
          { label: 'Yönetici',         value: stats.admins,  color: 'purple', icon: <Shield size={16} /> },
          { label: 'Şef',              value: stats.chiefs,  color: 'orange', icon: <Shield size={16} /> },
          { label: 'İşçi',             value: stats.workers, color: 'green',  icon: <Users size={16} /> },
        ].map((s) => (
          <div key={s.label} className={`kpi-card ${s.color}`}>
            <div className={`kpi-icon ${s.color}`}>{s.icon}</div>
            <div className="kpi-value">{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <div className="users-table-wrapper">
        {/* Toolbar */}
        <div className="users-table-toolbar">
          <div className="users-table-search">
            <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Kullanıcı adı veya rol ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={15} />
            Yeni Kullanıcı Ekle
          </button>
        </div>

        {/* Tablo */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="empty-state" style={{ padding: '60px 0' }}>
              <Loader2 size={36} className="spin" />
              <p>Kullanıcılar yükleniyor...</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kullanıcı Adı</th>
                  <th>Bant No</th>
                  <th>Sistem Rolü</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state" style={{ padding: '40px 0' }}>
                        <Users size={36} />
                        <p>Kullanıcı bulunamadı.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id}>
                      {/* Kullanıcı Adı */}
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar">
                            {user.name[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Bant No */}
                      <td>
                        <input
                          type="text"
                          className="inline-input"
                          value={user.lineNumber}
                          onChange={(e) => handleLineChange(user.id, e.target.value)}
                          title="Bant numarasını değiştirin"
                        />
                      </td>

                      {/* Rol */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ position: 'relative' }}>
                            <select
                              className="inline-select"
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                            <ChevronDown
                              size={10}
                              style={{
                                position: 'absolute', right: 8, top: '50%',
                                transform: 'translateY(-50%)', pointerEvents: 'none',
                                color: 'var(--text-muted)',
                              }}
                            />
                          </div>
                          <span className={`badge ${roleClass[user.role]}`}
                            style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                            {user.role}
                          </span>
                        </div>
                      </td>

                      {/* İşlemler */}
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className={`btn btn-sm ${savedRows.has(user.id) ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => handleSaveRow(user.id)}
                            disabled={savingRows.has(user.id)}
                            title="Değişiklikleri kaydet"
                          >
                            {savingRows.has(user.id) ? 'Kaydediliyor...' : 
                             savedRows.has(user.id) ? <><CheckCircle2 size={12} /> Kaydedildi</> : 'Kaydet'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger btn-icon"
                            onClick={() => setDeleteTarget(user)}
                            title="Kullanıcıyı sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Tablo altı bilgi */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{filtered.length} kullanıcı gösteriliyor</span>
          <span></span>
        </div>
      </div>

      {/* Modaller */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddUser}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDeleteUser}
          onClose={() => setDeleteTarget(null)}
        />
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

export default UsersPage;
