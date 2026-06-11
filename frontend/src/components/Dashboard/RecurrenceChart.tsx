// ============================================================
// RecurrenceChart — Arıza Tekrarlama Sıklığı (Stacked Bar)
// ============================================================

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { recurrenceData } from '../../data/mockCharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)', minWidth: 160,
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
            <span style={{ color: p.fill, fontSize: '0.8rem' }}>{p.name}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem' }}>{p.value}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 6, paddingTop: 6 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Toplam: <strong style={{ color: 'var(--text-primary)' }}>{total}</strong>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const LEGEND_LABELS: Record<string, string> = {
  mekanik:    'Mekanik',
  elektrik:   'Elektrik',
  yazilim:    'Yazılım',
  isGuvenlik: 'İş Güvenliği',
};

const RecurrenceChart: React.FC = () => (
  <div className="chart-card full-width">
    <div className="chart-title">Arıza Tekrarlama Sıklığı (Son 30 Gün)</div>
    <div className="chart-subtitle">
      Onarım sonrası 30 gün içinde aynı makinede tekrar açılan arıza sayısı — Bakım kalitesi göstergesi
    </div>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={recurrenceData}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
        <XAxis
          dataKey="makine"
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend
          wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingTop: 8 }}
          formatter={(val) => LEGEND_LABELS[val] || val}
        />
        <Bar dataKey="mekanik"    name="mekanik"    stackId="a" fill="#bc8cff" radius={[0,0,0,0]} maxBarSize={40} />
        <Bar dataKey="elektrik"   name="elektrik"   stackId="a" fill="#d29922" maxBarSize={40} />
        <Bar dataKey="yazilim"    name="yazilim"    stackId="a" fill="#388bfd" maxBarSize={40} />
        <Bar dataKey="isGuvenlik" name="isGuvenlik" stackId="a" fill="#f85149" radius={[4,4,0,0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default RecurrenceChart;
