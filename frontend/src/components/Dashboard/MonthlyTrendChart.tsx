// ============================================================
// MonthlyTrendChart — Aylara Göre Arıza Trendi (Area Chart)
// Gerçek API verisi kullanır
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/api';
import type { MonthlyTrendDto } from '../../services/api';

interface ChartData {
  month: string;
  ariza: number;
  cozulen: number;
}

const MONTH_OPTIONS = [
  { value: 6, label: 'Son 6 Ay' },
  { value: 8, label: 'Son 8 Ay' },
  { value: 12, label: 'Son 12 Ay' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color, fontSize: '0.83rem', marginBottom: 2 }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyTrendChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState(8);

  const fetchData = async (m: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getMonthlyTrend(m);
      if (res.isSuccess && res.data) {
        const chartData: ChartData[] = (res.data as MonthlyTrendDto[]).map((d) => ({
          month: d.month,
          ariza: d.totalCount,
          cozulen: d.resolvedCount,
        }));
        setData(chartData);
      } else {
        setError(res.message || 'Veri yüklenemedi.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(months);
  }, [months]);

  return (
    <div className="chart-card full-width">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
        <div>
          <div className="chart-title">Aylara Göre Arıza Trendi</div>
          <div className="chart-subtitle">Aylık toplam arıza ve çözülen rapor sayısı</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => fetchData(months)}
            disabled={loading}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Yenile"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220, color: 'var(--text-muted)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 220, color: '#f85149', gap: 8 }}>
          <AlertTriangle size={24} />
          <span style={{ fontSize: '0.82rem' }}>{error}</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAriza" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f85149" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f85149" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCozulen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3fb950" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis
              dataKey="month"
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingTop: 8 }}
              formatter={(val) => val === 'ariza' ? 'Toplam Arıza' : 'Çözülen'}
            />
            <Area
              type="monotone"
              dataKey="ariza"
              name="ariza"
              stroke="#f85149"
              strokeWidth={2}
              fill="url(#gradAriza)"
              dot={{ fill: '#f85149', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="cozulen"
              name="cozulen"
              stroke="#3fb950"
              strokeWidth={2}
              fill="url(#gradCozulen)"
              dot={{ fill: '#3fb950', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
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

export default MonthlyTrendChart;
