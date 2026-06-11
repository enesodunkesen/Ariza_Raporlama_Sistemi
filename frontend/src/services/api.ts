// ============================================================
// API Servisi — Backend Endpoint Bağlantıları
// ============================================================

const API_BASE = '/api';

// ─── Token Yönetimi ──────────────────────────────────────────

export const getToken = (): string | null => localStorage.getItem('auth_token');
export const setToken = (token: string): void => localStorage.setItem('auth_token', token);
export const removeToken = (): void => localStorage.removeItem('auth_token');

export interface AuthUser {
  token: string;
  expiration: string;
  userId: string;
  userName: string;
  role: string | null;
}

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const setStoredUser = (user: AuthUser): void => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem('auth_user');
};

// ─── Fetch Wrapper ───────────────────────────────────────────

interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message?: string;
  data?: T;
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Content-Type otomatik ayarla (FormData değilse)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // 401 — token geçersiz veya süresi dolmuş
  if (res.status === 401) {
    removeToken();
    removeStoredUser();
    window.location.reload();
    throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
  }

  const json: ApiResponse<T> = await res.json();
  return json;
}

// ─── Auth Servisi ────────────────────────────────────────────

export const authService = {
  async login(userName: string, password: string): Promise<ApiResponse<AuthUser>> {
    return apiFetch<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userName, password, platform: 'web' }),
    });
  },

  async register(userName: string, password: string, bandNumber: string): Promise<ApiResponse<AuthUser>> {
    return apiFetch<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ userName, password, bandNumber }),
    });
  },

  logout(): void {
    removeToken();
    removeStoredUser();
  },
};

// ─── Rapor DTO'ları ──────────────────────────────────────────

export interface FaultReportDto {
  id: number;
  description: string;
  bandNumber?: string;
  productCode?: string;
  errorCode?: string;
  status: string;
  imagePath?: string;
  createdDate: string;
  userId: string;
}

// ─── Report Servisi (User rolü) ─────────────────────────────

export const reportService = {
  async getMyReports(status?: string): Promise<ApiResponse<FaultReportDto[]>> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch<FaultReportDto[]>(`/reports/my-reports${query}`);
  },

  async create(formData: FormData): Promise<ApiResponse<FaultReportDto>> {
    return apiFetch<FaultReportDto>('/reports', {
      method: 'POST',
      body: formData,
    });
  },

  async getDashboardStats(): Promise<ApiResponse<UserDashboardStatsDto>> {
    return apiFetch<UserDashboardStatsDto>('/reports/dashboard-stats');
  },
};

// ─── Dashboard DTO'ları ──────────────────────────────────────

export interface UserDashboardStatsDto {
  todayCount: number;
  weeklyCount: number;
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
}

export interface AdminDashboardStatsDto {
  totalReports: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  todayCount: number;
  totalMaintenanceRequests: number;
}

export interface FaultByBandDto {
  bandNumber: string;
  faultCount: number;
}

export interface MonthlyTrendDto {
  month: string;
  totalCount: number;
  resolvedCount: number;
}

export interface ResolutionRateDto {
  name: string;
  value: number;
  color: string;
}

// ─── Maintenance Request DTO'ları ────────────────────────────

export interface MaintenanceRequestDto {
  id: number;
  reportId: number;
  requestText: string;
  status: string;
  createdDate: string;
  createdById: string;
}

// ─── Admin Servisi ───────────────────────────────────────────

export const adminService = {
  async getReports(status?: string): Promise<ApiResponse<FaultReportDto[]>> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch<FaultReportDto[]>(`/admin/reports${query}`);
  },

  async updateReportStatus(reportId: number, newStatus: string): Promise<ApiResponse> {
    return apiFetch('/admin/reports/' + reportId + '/status', {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });
  },

  async getRequests(): Promise<ApiResponse<MaintenanceRequestDto[]>> {
    return apiFetch<MaintenanceRequestDto[]>('/admin/requests');
  },

  async createRequest(reportId: number, requestText: string): Promise<ApiResponse<MaintenanceRequestDto>> {
    return apiFetch<MaintenanceRequestDto>('/admin/requests', {
      method: 'POST',
      body: JSON.stringify({ reportId, requestText }),
    });
  },

  async getDashboardStats(): Promise<ApiResponse<AdminDashboardStatsDto>> {
    return apiFetch<AdminDashboardStatsDto>('/admin/stats');
  },

  async getFaultsByBand(status?: string): Promise<ApiResponse<FaultByBandDto[]>> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch<FaultByBandDto[]>(`/admin/stats/faults-by-band${query}`);
  },

  async getMonthlyTrend(months: number = 8): Promise<ApiResponse<MonthlyTrendDto[]>> {
    return apiFetch<MonthlyTrendDto[]>(`/admin/stats/monthly-trend?months=${months}`);
  },

  async getResolutionRates(): Promise<ApiResponse<ResolutionRateDto[]>> {
    return apiFetch<ResolutionRateDto[]>('/admin/stats/resolution-rate');
  },

  async getUsers(): Promise<ApiResponse<AdminUserDto[]>> {
    return apiFetch<AdminUserDto[]>('/admin/users');
  },

  async createUser(userData: any): Promise<ApiResponse> {
    return apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    return apiFetch(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async deleteUser(id: string): Promise<ApiResponse> {
    return apiFetch(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async deleteReport(id: number): Promise<ApiResponse> {
    return apiFetch(`/admin/reports/${id}`, {
      method: 'DELETE',
    });
  },

  async updateRequestStatus(requestId: number, newStatus: string): Promise<ApiResponse> {
    return apiFetch('/admin/requests/' + requestId + '/status', {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });
  },
};

export interface AdminUserDto {
  id: string;
  userName: string;
  email: string;
  bandNumber?: string;
  role: string;
}

