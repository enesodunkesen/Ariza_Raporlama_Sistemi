// ============================================================
// Fabrika Arıza Bildirim Sistemi — TypeScript Tip Tanımlamaları
// ============================================================

// --- Enum / Union Tipler ---

export type ReportStatus = 'Beklemede' | 'İşleme Alındı' | 'Tamamlandı';

export type RequestStatus = 'Beklemede' | 'Onaylandı';

export type UserRole = 'İşçi' | 'Admin' | 'Şef';

export type FaultCategory = 'Mekanik' | 'Elektrik' | 'Yazılım' | 'İş Güvenliği' | 'Pneumatik' | 'Hidrolik';


// --- Arıza Raporu (Backend DTO ile uyumlu) ---

export interface FaultReport {
  id: number;
  description: string;
  bandNumber?: string;
  productCode?: string;
  errorCode?: string;
  status: ReportStatus;
  imagePath?: string;
  createdDate: string;
  userId: string;
}

// --- Bakım Talebi (Backend DTO ile uyumlu) ---

export interface MaintenanceRequest {
  id: number;
  reportId: number;
  requestText: string;
  status: string;
  createdDate: string;
  createdById: string;
}

// --- Eski frontend tipleri (mock veriler için korunuyor) ---

export interface FaultReportLegacy {
  id: string;
  reporterName: string;
  reporterSurname: string;
  reporterRole: UserRole;
  machineArea: string;
  lineNumber: number;
  category: FaultCategory;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRequest {
  id: string;
  requesterName: string;
  requesterSurname: string;
  requesterRole: UserRole;
  title: string;
  description: string;
  targetLine: number;
  targetLocation: string;
  status: RequestStatus;
  createdAt: string;
}

// --- Kullanıcı (mock veriler için) ---

export interface User {
  id: string;
  employeeId: string;
  name: string;
  surname: string;
  email?: string;
  lineNumber: string;
  role: UserRole;
  department: string;
  createdAt: string;
}

// --- Grafik Veri Tipleri ---

export interface BarChartData {
  line: string;
  ariza: number;
}

export interface LineChartData {
  month: string;
  ariza: number;
  cozulen: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface StackedBarData {
  makine: string;
  mekanik: number;
  elektrik: number;
  yazilim: number;
  isGuvenlik: number;
}

// --- Auth ---

export interface AuthState {
  isLoggedIn: boolean;
  currentUser: User | null;
}

// --- Navigation ---

export type PageKey = 'dashboard' | 'reports' | 'requests' | 'users';
