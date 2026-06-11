// ============================================================
// DashboardPage — Performans Grafikleri Ana Sayfası
// ============================================================

import React from 'react';
import KPICards from './KPICards';
import FaultByLineChart from './FaultByLineChart';
import MonthlyTrendChart from './MonthlyTrendChart';
import ResolutionPieChart from './ResolutionPieChart';

const DashboardPage: React.FC = () => {
  return (
    <div>
      {/* Sayfa Başlığı */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Performans Grafikleri</h1>
            <p>Fabrika operasyonel verimlilik metrikleri ve arıza analitikleri.</p>
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px',
            }}
          >
            📅 Haziran 2024 — Güncel Veriler
          </div>
        </div>
      </div>

      {/* KPI Kartları + MTTR Gauge */}
      <KPICards />

      {/* Grafik Grid: 2x2 */}
      <div className="charts-grid">
        {/* 1. Aylık Trend */}
        <MonthlyTrendChart />

        {/* 2. Banta Göre Arıza Dağılımı */}
        <FaultByLineChart />

        {/* 3. Çözülme Oranı (Donut) */}
        <ResolutionPieChart />


      </div>
    </div>
  );
};

export default DashboardPage;
