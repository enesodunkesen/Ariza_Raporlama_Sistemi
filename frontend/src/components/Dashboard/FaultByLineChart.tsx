// ============================================================
// FaultByLineChart — Üretim Bantlarına Göre Arıza Dağılımı (Bar)
// Gerçek API verisi kullanır
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/api';
import type { FaultByBandDto } from '../../services/api';

const COLORS = ['#1f6feb', '#388bfd', '#d29922', '#f85149', '#3fb950', '#a371f7', '#79c0ff'];

const STATUS_OPTIONS = [
  { value: '', label: 'Tümü' },
  { value: 'Pending', label: 'Beklemede' },
  { value: 'InProgress', label: 'İşleme Alındı' },
  { value: 'Resolved', label: 'Tamamlandı' },
];

interface ChartData {
  line: string;
  ariza: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--blue-accent)', fontSize: '0.85rem' }}>
          Arıza Sayısı: <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const FaultByLineChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getFaultsByBand(status || undefined);
      if (res.isSuccess && res.data) {
        const chartData: ChartData[] = (res.data as FaultByBandDto[]).map((d) => ({
          line: d.bandNumber,
          ariza: d.faultCount,
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
    fetchData(statusFilter);
  }, [statusFilter]);

  return (
    <div className="chart-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
        <div>
          <div className="chart-title">Üretim Bantlarına Göre Arıza Dağılımı</div>
          <div className="chart-subtitle">Her hattın toplam arıza yükü — darboğaz tespiti</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => fetchData(statusFilter)}
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
      ) : data.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Bu filtre için veri bulunamadı.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 16, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis
              dataKey="line"
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="ariza" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
              <LabelList
                dataKey="ariza"
                position="top"
                style={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
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

export default FaultByLineChart;
