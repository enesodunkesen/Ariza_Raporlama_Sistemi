// ============================================================
// Mock Data — Grafik Verileri (Recharts formatında)
// ============================================================

import type {
  BarChartData,
  LineChartData,
  PieChartData,
  StackedBarData,
} from '../types';

// 1. Üretim Bantlarına Göre Arıza Dağılımı (Bar Chart)
export const faultByLineData: BarChartData[] = [
  { line: 'Hat 1', ariza: 28 },
  { line: 'Hat 2', ariza: 35 },
  { line: 'Hat 3', ariza: 22 },
  { line: 'Hat 4', ariza: 41 },
  { line: 'Hat 5', ariza: 18 },
];

// 2. Aylara Göre Arıza Trendi (Line Chart) — Son 8 ay
export const monthlyTrendData: LineChartData[] = [
  { month: 'Kas 23', ariza: 42, cozulen: 38 },
  { month: 'Ara 23', ariza: 55, cozulen: 50 },
  { month: 'Oca 24', ariza: 48, cozulen: 44 },
  { month: 'Şub 24', ariza: 61, cozulen: 55 },
  { month: 'Mar 24', ariza: 53, cozulen: 50 },
  { month: 'Nis 24', ariza: 67, cozulen: 60 },
  { month: 'May 24', ariza: 58, cozulen: 52 },
  { month: 'Haz 24', ariza: 44, cozulen: 38 },
];

// 3. Raporlanan Arızaların Çözülme Oranı (Donut Chart)
export const resolutionRateData: PieChartData[] = [
  { name: 'Tamamlandı', value: 58, color: '#3fb950' },
  { name: 'İşleme Alındı', value: 27, color: '#1f6feb' },
  { name: 'Beklemede', value: 15, color: '#d29922' },
];

// 4. Arıza Tekrarlama Sıklığı — 30 gün içinde (Stacked Bar)
export const recurrenceData: StackedBarData[] = [
  { makine: 'CNC Freze', mekanik: 4, elektrik: 1, yazilim: 0, isGuvenlik: 0 },
  { makine: 'Robotik Kol', mekanik: 1, elektrik: 2, yazilim: 5, isGuvenlik: 0 },
  { makine: 'Bant Konv.', mekanik: 6, elektrik: 0, yazilim: 0, isGuvenlik: 1 },
  { makine: 'Kaynak Mk.', mekanik: 2, elektrik: 4, yazilim: 0, isGuvenlik: 2 },
  { makine: 'Lazer Kes.', mekanik: 1, elektrik: 2, yazilim: 3, isGuvenlik: 0 },
  { makine: 'Pres Mk.', mekanik: 5, elektrik: 1, yazilim: 0, isGuvenlik: 1 },
];

// Genel KPI değerleri
export const kpiData = {
  totalReports: 144,
  resolvedThisMonth: 38,
  pendingCritical: 3,
  avgMTTR: 6.36, // Genel ortalama (saat)
  resolutionRate: 82, // Yüzde olarak
};
