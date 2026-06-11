import { Report, Request, User, WorkflowStatus } from '@/models/Report';

// Varsayılan API Base URL
// Expo Go (fiziksel cihaz) ile test edebilmek için bilgisayarınızın yerel ağ IP adresi kullanıldı.
const BASE_DOMAIN = 'http://192.168.1.4:50208';
const API_BASE_URL = `${BASE_DOMAIN}/api`;

class ReportService {
  private static instance: ReportService;
  private currentUser: User | null = null;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  // Helper method for authenticated fetch requests
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
  }

  // --- Auth İşlemleri ---
  public async login(username: string, password: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: username, password, platform: 'mobile' }),
      });

      if (!response.ok) return null;

      const result = await response.json();
      if (result.isSuccess && result.data && result.data.token) {
        this.token = result.data.token;

        // JWT token'dan rol bilgisini parse et
        const role = this.parseRoleFromToken(result.data.token);

        this.currentUser = {
          id: result.data.userId || '1',
          username: result.data.userName || username,
          password: '',
          bantNumber: result.data.bandNumber || 'BANT001',
          role: role
        };
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  // JWT token'dan rol claim'ini parse eden yardımcı metot
  private parseRoleFromToken(token: string): 'user' | 'chief' {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      // ClaimTypes.Role -> "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'] || '';
      if (roleClaim.toLowerCase() === 'chief') return 'chief';
      return 'user';
    } catch {
      return 'user';
    }
  }

  public logout(): void {
    this.currentUser = null;
    this.token = null;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Helper method to map backend DTO to frontend Report interface
  private mapDtoToReport(dto: any): Report {
    let mappedStatus: WorkflowStatus = 'pending';
    const dtoStatus = dto.status?.toLowerCase() || '';
    if (dtoStatus === 'pending') {
      mappedStatus = 'pending';
    } else if (dtoStatus === 'inprogress' || dtoStatus === 'in_progress') {
      mappedStatus = 'in_progress';
    } else if (dtoStatus === 'resolved' || dtoStatus === 'completed') {
      mappedStatus = 'completed';
    }

    let photoUrls: string[] = [];
    if (dto.imagePath) {
      photoUrls = [dto.imagePath.startsWith('http') ? dto.imagePath : `${BASE_DOMAIN}${dto.imagePath}`];
    } else if (dto.photos && Array.isArray(dto.photos)) {
      photoUrls = dto.photos.map((p: string) => p.startsWith('http') ? p : `${BASE_DOMAIN}${p}`);
    }

    return {
      id: dto.id?.toString() || dto.id || '',
      reportNumber: dto.reportNumber || (dto.id ? `REP-${dto.id.toString().padStart(4, '0')}` : 'N/A'),
      bantNumber: dto.bandNumber || dto.bantNumber || '',
      productCode: dto.productCode || '',
      errorCode: dto.errorCode || '',
      description: dto.description || '',
      photos: photoUrls,
      createdAt: dto.createdDate ? new Date(dto.createdDate) : (dto.createdAt ? new Date(dto.createdAt) : new Date()),
      createdBy: dto.userId || dto.createdBy || '',
      status: mappedStatus,
    };
  }

  // --- Rapor İşlemleri ---
  public async getAllReports(): Promise<Report[]> {
    try {
      const response = await this.fetchWithAuth('/admin/reports');
      if (!response.ok) return [];
      const result = await response.json();
      return (result.data || []).map((dto: any) => this.mapDtoToReport(dto));
    } catch (error) {
      console.error('getAllReports error:', error);
      return [];
    }
  }

  public async getReportsByUser(username: string): Promise<Report[]> {
    try {
      const response = await this.fetchWithAuth('/reports/my-reports');
      if (!response.ok) return [];
      const result = await response.json();
      return (result.data || []).map((dto: any) => this.mapDtoToReport(dto));
    } catch (error) {
      console.error('getReportsByUser error:', error);
      return [];
    }
  }

  public async getReportsByStatus(status: WorkflowStatus, username?: string): Promise<Report[]> {
    let apiStatus = status as string;
    if (status === 'in_progress') apiStatus = 'InProgress';
    if (status === 'completed') apiStatus = 'Resolved';
    
    const url = username ? `/reports/my-reports?status=${apiStatus}` : `/admin/reports?status=${apiStatus}`;
    try {
      const response = await this.fetchWithAuth(url);
      if (!response.ok) return [];
      const result = await response.json();
      return (result.data || []).map((dto: any) => this.mapDtoToReport(dto));
    } catch (error) {
      console.error('getReportsByStatus error:', error);
      return [];
    }
  }

  public async addReport(report: Partial<Report>): Promise<Report | null> {
    try {
      const formData = new FormData();
      if (report.productCode) formData.append('ProductCode', report.productCode);
      if (report.errorCode) formData.append('ErrorCode', report.errorCode);
      if (report.description) formData.append('Description', report.description);
      
      if (report.photos && report.photos.length > 0) {
        const photoUri = report.photos[0];
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1].toLowerCase() : 'jpg';
        // Map extensions to correct MIME types (.jpg -> image/jpeg, not image/jpg)
        const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
        const type = mimeMap[ext] || 'image/jpeg';
        
        // Use the RN-specific {uri, name, type} object — this works with XMLHttpRequest
        formData.append('Image', {
          uri: photoUri,
          name: filename,
          type: type,
        } as any);
      }
      
      // Use XMLHttpRequest instead of fetch for file uploads.
      // Expo's modern fetch API does not support the RN {uri,name,type} FormData pattern,
      // but XMLHttpRequest still does.
      return new Promise<Report | null>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/reports`);
        
        if (this.token) {
          xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
        }
        // Do NOT set Content-Type — XHR will set multipart/form-data with boundary automatically
        
        xhr.onload = () => {
          try {
            const result = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && result.data) {
              resolve(this.mapDtoToReport(result.data));
            } else {
              console.error('addReport server error:', xhr.status, xhr.responseText);
              resolve(null);
            }
          } catch (parseError) {
            console.error('addReport parse error:', parseError);
            resolve(null);
          }
        };
        
        xhr.onerror = () => {
          console.error('addReport XHR error');
          resolve(null);
        };
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error('addReport error:', error);
      return null;
    }
  }

  public async updateReportStatus(reportId: string, status: WorkflowStatus): Promise<Report | null> {
    try {
      const response = await this.fetchWithAuth(`/admin/reports/${reportId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data ? this.mapDtoToReport(result.data) : null;
    } catch (error) {
      console.error('updateReportStatus error:', error);
      return null;
    }
  }

  // --- İstatistik İşlemleri ---
  public async getAdminDashboardStats(): Promise<any> {
    try {
      const response = await this.fetchWithAuth('/admin/stats');
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('getAdminDashboardStats error:', error);
      return null;
    }
  }

  public async getUserDashboardStats(): Promise<any> {
    try {
      const response = await this.fetchWithAuth('/reports/dashboard-stats');
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('getUserDashboardStats error:', error);
      return null;
    }
  }

  // Fallback sync methods for currently unbroken compilation (Will be refactored out in UI components)
  // We throw errors so we know where we need to fix
  public getTodayReportsCount(): number { throw new Error('Not implemented async'); }
  public getWeeklyReportsCount(): number { throw new Error('Not implemented async'); }
  public getTotalReportsCount(username?: string): number { throw new Error('Not implemented async'); }
  public getTodayReportsCountByUser(username: string): number { throw new Error('Not implemented async'); }
  public getWeeklyReportsCountByUser(username: string): number { throw new Error('Not implemented async'); }

  public getReportCountsByStatus(username: string): Record<WorkflowStatus, number> {
    throw new Error('Not implemented async');
  }

  // Helper method to map backend DTO to frontend Request interface
  private mapDtoToRequest(dto: any): Request {
    let mappedStatus: WorkflowStatus = 'pending';
    const dtoStatus = dto.status?.toLowerCase() || '';
    if (dtoStatus === 'pending') {
      mappedStatus = 'pending';
    } else if (dtoStatus === 'inprogress' || dtoStatus === 'in_progress') {
      mappedStatus = 'in_progress';
    } else if (dtoStatus === 'resolved' || dtoStatus === 'completed') {
      mappedStatus = 'completed';
    }

    return {
      id: dto.id?.toString() || dto.id || '',
      requestNumber: dto.requestNumber || (dto.id ? `REQ-${dto.id.toString().padStart(4, '0')}` : 'N/A'),
      reportNumber: dto.reportNumber || (dto.reportId ? `REP-${dto.reportId.toString().padStart(4, '0')}` : 'N/A'),
      requestText: dto.requestText || '',
      createdAt: dto.createdDate ? new Date(dto.createdDate) : (dto.createdAt ? new Date(dto.createdAt) : new Date()),
      createdBy: dto.createdById || dto.createdBy || '',
      status: mappedStatus,
    };
  }

  // --- Talep İşlemleri ---
  public async addRequest(reportNumber: string, requestText: string): Promise<{ success: boolean; data?: Request; error?: string }> {
    try {
      const response = await this.fetchWithAuth('/admin/requests', {
        method: 'POST',
        body: JSON.stringify({ reportId: parseInt(reportNumber.replace(/\D/g, '') || '0'), requestText }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Talep oluşturulurken bir sorun oluştu.' };
      }
      return result.isSuccess && result.data 
        ? { success: true, data: this.mapDtoToRequest(result.data) }
        : { success: false, error: result.message || 'Talep oluşturulurken bir sorun oluştu.' };
    } catch (error) {
      console.error('addRequest error:', error);
      return { success: false, error: 'Sunucuya bağlanırken bir hata oluştu.' };
    }
  }

  // --- Kullanıcı Ekleme ---
  public async addUser(username: string, password: string): Promise<User | null> {
    try {
      const response = await this.fetchWithAuth('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          userName: username,
          email: `${username}@example.com`,
          password: password,
          bandNumber: 'B001', // Standard band number default
          role: 'User'
        }),
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data as User;
    } catch (error) {
      console.error('addUser error:', error);
      return null;
    }
  }

  public async getAllRequests(): Promise<Request[]> {
    try {
      const response = await this.fetchWithAuth('/admin/requests');
      if (!response.ok) return [];
      const result = await response.json();
      return (result.data || []).map((dto: any) => this.mapDtoToRequest(dto));
    } catch (error) {
      console.error('getAllRequests error:', error);
      return [];
    }
  }

  // Bant işlemleri
  public async getReportsByBant(bantNumber: string): Promise<Report[]> {
    throw new Error('Not implemented async');
  }
}

export default ReportService;
