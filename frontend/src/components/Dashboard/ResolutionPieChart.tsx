// ============================================================
// ResolutionPieChart — Çözülme Oranı (Donut Chart)
// Gerçek API verisi kullanır
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { adminService } from '../../services/api';
import type { ResolutionRateDto } from '../../services/api';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: payload[0].payload.color || 'var(--text-primary)', fontWeight: 700, marginBottom: 2 }}>
          {payload[0].name}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Oran: <strong style={{ color: 'var(--text-primary)' }}>%{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const ResolutionPieChart: React.FC = () => {
  const [data, setData] = useState<ResolutionRateDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getResolutionRates();
      if (res.isSuccess && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Veri yüklenirken hata oluştu.');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resolvedItem = data.find(x => x.name === 'Tamamlandı');
  const resolvedPercent = resolvedItem ? resolvedItem.value : 0;

  // Merkez label renderer
  const renderCenterLabel = ({ cx, cy }: any) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" fontSize="22" fontWeight="800" fill="var(--text-primary)">
        %{resolvedPercent}
      </tspan>
      <tspan x={cx} dy="22" fontSize="11" fill="var(--text-muted)">
        Çözüm Oranı
      </tspan>
    </text>
  );

  return (
    <div className="chart-card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="chart-title">Arıza Çözülme Oranı</div>
          <div className="chart-subtitle">Toplam raporların durum dağılımı</div>
        </div>
        <button 
          onClick={fetchData} 
          disabled={loading}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', 
            cursor: 'pointer', fontSize: '0.85rem', padding: '4px 8px', borderRadius: 4,
            transition: 'color 0.2s'
          }}
          title="Yenile"
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {loading ? '...' : '↻'}
        </button>
      </div>

      {loading && (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Yükleniyor...
        </div>
      )}

      {error && !loading && (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f85149', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Kayıtlı arıza raporu bulunamadı.
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={renderCenterLabel}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={9}
              wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingTop: 6 }}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value} (%{entry.payload.value})</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ResolutionPieChart;
