import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarChart3, Sliders, Layers, Clock, ShoppingCart, Info } from 'lucide-react';
import '../utils/chartConfig';

export default function HistogramsSection({ orders = [], products = [], users = [] }) {
  const [activeHistogramTab, setActiveHistogramTab] = useState('orderAmount');
  const [binCount, setBinCount] = useState(10);
  const [colorScheme, setColorScheme] = useState('indigo');

  // 1. Order Amount Histogram Calculation
  const orderAmountHistogramData = useMemo(() => {
    if (!orders.length) return { labels: [], data: [], stats: {} };

    const amounts = orders.map(o => Number(o.amount) || 0).filter(a => a > 0);
    const min = Math.floor(Math.min(...amounts));
    const max = Math.ceil(Math.max(...amounts));
    const step = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const labels = [];

    for (let i = 0; i < binCount; i++) {
      const start = Math.round(min + i * step);
      const end = Math.round(min + (i + 1) * step);
      labels.push(`$${start} - $${end}`);
    }

    amounts.forEach(amt => {
      let index = Math.floor((amt - min) / step);
      if (index >= binCount) index = binCount - 1;
      if (index < 0) index = 0;
      bins[index]++;
    });

    const sum = amounts.reduce((a, b) => a + b, 0);
    const avg = sum / amounts.length;
    const sorted = [...amounts].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;

    return {
      labels,
      data: bins,
      stats: { min, max, avg, median, count: amounts.length }
    };
  }, [orders, binCount]);

  // 2. Product Validity Duration Histogram
  const validityHistogramData = useMemo(() => {
    if (!products.length) return { labels: [], data: [] };

    const validities = products.map(p => Number(p.validity) || 0).filter(v => v > 0);
    const binsMap = {
      '1 - 3 Days': 0,
      '4 - 7 Days': 0,
      '8 - 14 Days': 0,
      '15 - 30 Days': 0,
      '31 - 90 Days': 0,
      '90+ Days': 0
    };

    validities.forEach(v => {
      if (v <= 3) binsMap['1 - 3 Days']++;
      else if (v <= 7) binsMap['4 - 7 Days']++;
      else if (v <= 14) binsMap['8 - 14 Days']++;
      else if (v <= 30) binsMap['15 - 30 Days']++;
      else if (v <= 90) binsMap['31 - 90 Days']++;
      else binsMap['90+ Days']++;
    });

    return {
      labels: Object.keys(binsMap),
      data: Object.values(binsMap)
    };
  }, [products]);

  // 3. Customer Order Frequency Histogram
  const customerFrequencyHistogramData = useMemo(() => {
    if (!orders.length) return { labels: [], data: [] };

    const userCounts = {};
    orders.forEach(o => {
      if (o.user_id) {
        userCounts[o.user_id] = (userCounts[o.user_id] || 0) + 1;
      }
    });

    const freqBins = {
      '1 Order': 0,
      '2 Orders': 0,
      '3 Orders': 0,
      '4 Orders': 0,
      '5+ Orders': 0
    };

    Object.values(userCounts).forEach(cnt => {
      if (cnt === 1) freqBins['1 Order']++;
      else if (cnt === 2) freqBins['2 Orders']++;
      else if (cnt === 3) freqBins['3 Orders']++;
      else if (cnt === 4) freqBins['4 Orders']++;
      else freqBins['5+ Orders']++;
    });

    return {
      labels: Object.keys(freqBins),
      data: Object.values(freqBins)
    };
  }, [orders]);

  // Color theme generator
  const getBarColor = () => {
    switch (colorScheme) {
      case 'cyan': return { bg: 'rgba(6, 182, 212, 0.7)', border: '#06b6d4' };
      case 'emerald': return { bg: 'rgba(16, 185, 129, 0.7)', border: '#10b981' };
      case 'amber': return { bg: 'rgba(245, 158, 11, 0.7)', border: '#f59e0b' };
      case 'purple': return { bg: 'rgba(168, 85, 247, 0.7)', border: '#a855f7' };
      default: return { bg: 'rgba(99, 102, 241, 0.7)', border: '#6366f1' };
    }
  };

  const currentColor = getBarColor();

  const chartDataConfig = useMemo(() => {
    let current = orderAmountHistogramData;
    let label = 'Order Frequency (Count)';

    if (activeHistogramTab === 'validity') {
      current = validityHistogramData;
      label = 'eSIM Product Count';
    } else if (activeHistogramTab === 'customerFreq') {
      current = customerFrequencyHistogramData;
      label = 'Customer Count';
    }

    return {
      labels: current.labels,
      datasets: [
        {
          label,
          data: current.data,
          backgroundColor: currentColor.bg,
          borderColor: currentColor.border,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          categoryPercentage: 0.95,
          barPercentage: 0.98
        }
      ]
    };
  }, [activeHistogramTab, orderAmountHistogramData, validityHistogramData, customerFrequencyHistogramData, currentColor]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'var(--text-secondary)',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: currentColor.border,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            return ` ${context.dataset.label}: ${context.parsed.y.toLocaleString()} entries`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'var(--text-muted)', font: { size: 11 } },
        title: {
          display: true,
          text:
            activeHistogramTab === 'orderAmount'
              ? 'Order Amount Range ($)'
              : activeHistogramTab === 'validity'
              ? 'Validity Duration Category'
              : 'Orders per Customer',
          color: 'var(--text-secondary)',
          font: { weight: '600', size: 12 }
        }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'var(--text-muted)', font: { size: 11 } },
        title: {
          display: true,
          text: 'Frequency / Count',
          color: 'var(--text-secondary)',
          font: { weight: '600', size: 12 }
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="chart-card col-12">
      <div className="chart-header">
        <div>
          <div className="chart-title">
            <BarChart3 className="w-5 h-5" style={{ color: currentColor.border }} />
            <span>Interactive Data Histogram Analysis</span>
            <span className="badge badge-indigo">Statistical Distribution</span>
          </div>
          <div className="chart-subtitle">
            Visualize frequency distribution, continuous binning, and variance across transaction values, customer behavior, and product specs.
          </div>
        </div>

        <div className="chart-controls">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeHistogramTab === 'orderAmount' ? 'active' : ''}`}
              onClick={() => setActiveHistogramTab('orderAmount')}
            >
              Order Amounts ($)
            </button>
            <button
              className={`tab-btn ${activeHistogramTab === 'validity' ? 'active' : ''}`}
              onClick={() => setActiveHistogramTab('validity')}
            >
              Plan Validity (Days)
            </button>
            <button
              className={`tab-btn ${activeHistogramTab === 'customerFreq' ? 'active' : ''}`}
              onClick={() => setActiveHistogramTab('customerFreq')}
            >
              Customer Order Freq
            </button>
          </div>

          {activeHistogramTab === 'orderAmount' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bins:</label>
              <select
                className="select-field"
                value={binCount}
                onChange={e => setBinCount(Number(e.target.value))}
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <option value={6}>6 Bins</option>
                <option value={10}>10 Bins</option>
                <option value={15}>15 Bins</option>
                <option value={20}>20 Bins</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {['indigo', 'cyan', 'emerald', 'amber', 'purple'].map(c => (
              <button
                key={c}
                onClick={() => setColorScheme(c)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: colorScheme === c ? '2px solid #fff' : 'none',
                  background:
                    c === 'indigo'
                      ? '#6366f1'
                      : c === 'cyan'
                      ? '#06b6d4'
                      : c === 'emerald'
                      ? '#10b981'
                      : c === 'amber'
                      ? '#f59e0b'
                      : '#a855f7',
                  cursor: 'pointer'
                }}
                title={`Color theme ${c}`}
              />
            ))}
          </div>
        </div>
      </div>

      {activeHistogramTab === 'orderAmount' && orderAmountHistogramData.stats.avg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '10px 16px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info className="w-4 h-4" style={{ color: currentColor.border }} />
            <span style={{ color: 'var(--text-muted)' }}>Stats Summary:</span>
          </div>
          <div>Min: <strong style={{ color: '#fff' }}>${orderAmountHistogramData.stats.min.toLocaleString()}</strong></div>
          <div>Max: <strong style={{ color: '#fff' }}>${orderAmountHistogramData.stats.max.toLocaleString()}</strong></div>
          <div>Mean (Avg): <strong style={{ color: 'var(--accent-cyan)' }}>${Math.round(orderAmountHistogramData.stats.avg).toLocaleString()}</strong></div>
          <div>Median: <strong style={{ color: 'var(--accent-emerald)' }}>${Math.round(orderAmountHistogramData.stats.median).toLocaleString()}</strong></div>
          <div>Sample Count: <strong style={{ color: '#fff' }}>{orderAmountHistogramData.stats.count.toLocaleString()} orders</strong></div>
        </div>
      )}

      <div className="chart-body tall">
        <Bar data={chartDataConfig} options={chartOptions} />
      </div>
    </div>
  );
}
