import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Calendar, Activity, DollarSign, Users, Award } from 'lucide-react';
import '../utils/chartConfig';

export default function LineChartsSection({ orders = [], users = [] }) {
  const [timeGroup, setTimeGroup] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [activeTab, setActiveTab] = useState('revenueVolume'); // 'revenueVolume' | 'userGrowth' | 'aovTrend'

  // Helper to format date keys based on daily/weekly/monthly aggregation
  const getGroupKey = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown';

    if (timeGroup === 'monthly') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (timeGroup === 'weekly') {
      // Calculate start of week (Sunday)
      const day = d.getDay();
      const diff = d.getDate() - day;
      const weekStart = new Date(d.setDate(diff));
      return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    }
    // Daily
    return dateStr.substring(0, 10);
  };

  // 1. Process Revenue & Order Volume Time Series
  const timeSeriesData = useMemo(() => {
    if (!orders.length) return { labels: [], revenue: [], volume: [], aov: [] };

    // Sort orders chronologically
    const sorted = [...orders].sort((a, b) => new Date(a.order_date_time) - new Date(b.order_date_time));

    const map = {};
    sorted.forEach(o => {
      const key = getGroupKey(o.order_date_time);
      if (!map[key]) {
        map[key] = { revenue: 0, count: 0 };
      }
      map[key].revenue += Number(o.amount) || 0;
      map[key].count += 1;
    });

    const labels = Object.keys(map);
    const revenue = labels.map(k => Math.round(map[k].revenue));
    const volume = labels.map(k => map[k].count);
    const aov = labels.map(k => Math.round(map[k].revenue / (map[k].count || 1)));

    return { labels, revenue, volume, aov };
  }, [orders, timeGroup]);

  // 2. Process User Registrations & Growth Time Series
  const userSeriesData = useMemo(() => {
    if (!users.length) return { labels: [], dailyNew: [], cumulative: [] };

    const sortedUsers = [...users].sort((a, b) => new Date(a.created_dateTime) - new Date(b.created_dateTime));
    const map = {};

    sortedUsers.forEach(u => {
      const key = getGroupKey(u.created_dateTime);
      map[key] = (map[key] || 0) + 1;
    });

    const labels = Object.keys(map);
    const dailyNew = labels.map(k => map[k]);

    let runningTotal = 0;
    const cumulative = dailyNew.map(count => {
      runningTotal += count;
      return runningTotal;
    });

    return { labels, dailyNew, cumulative };
  }, [users, timeGroup]);

  // Configure Chart Data depending on Active Tab
  const lineChartData = useMemo(() => {
    if (activeTab === 'userGrowth') {
      return {
        labels: userSeriesData.labels,
        datasets: [
          {
            label: 'New Registrations',
            data: userSeriesData.dailyNew,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            tension: 0.35,
            yAxisID: 'y'
          },
          {
            label: 'Cumulative User Base',
            data: userSeriesData.cumulative,
            borderColor: '#a855f7',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            tension: 0.2,
            yAxisID: 'y1'
          }
        ]
      };
    }

    if (activeTab === 'aovTrend') {
      return {
        labels: timeSeriesData.labels,
        datasets: [
          {
            label: 'Average Order Value ($)',
            data: timeSeriesData.aov,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.35,
            yAxisID: 'y'
          }
        ]
      };
    }

    // Default: Revenue & Order Volume
    return {
      labels: timeSeriesData.labels,
      datasets: [
        {
          label: 'Gross Revenue ($)',
          data: timeSeriesData.revenue,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          fill: true,
          tension: 0.35,
          yAxisID: 'y'
        },
        {
          label: 'Order Volume (Count)',
          data: timeSeriesData.volume,
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.35,
          yAxisID: 'y1'
        }
      ]
    };
  }, [activeTab, timeSeriesData, userSeriesData]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
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
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let val = context.parsed.y;
            if (label.includes('($)')) {
              return ` ${label}: $${val.toLocaleString()}`;
            }
            return ` ${label}: ${val.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: 'var(--text-muted)',
          font: { size: 11 },
          maxRotation: 45
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'var(--text-muted)', font: { size: 11 } },
        title: {
          display: true,
          text: activeTab === 'userGrowth' ? 'Daily Signups' : activeTab === 'aovTrend' ? 'AOV ($)' : 'Revenue ($)',
          color: 'var(--text-secondary)',
          font: { weight: '600', size: 11 }
        }
      },
      y1: {
        type: 'linear',
        display: activeTab !== 'aovTrend',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: 'var(--text-muted)', font: { size: 11 } },
        title: {
          display: true,
          text: activeTab === 'userGrowth' ? 'Total Users' : 'Order Count',
          color: 'var(--text-secondary)',
          font: { weight: '600', size: 11 }
        }
      }
    }
  };

  return (
    <div className="chart-card col-12">
      <div className="chart-header">
        <div>
          <div className="chart-title">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
            <span>Time-Series Revenue & Growth Trend Lines</span>
            <span className="badge badge-cyan">Chronological Analytics</span>
          </div>
          <div className="chart-subtitle">
            Monitor sales velocity, customer acquisition, and AOV fluctuations across daily, weekly, or monthly timeframes.
          </div>
        </div>

        <div className="chart-controls">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'revenueVolume' ? 'active' : ''}`}
              onClick={() => setActiveTab('revenueVolume')}
            >
              Revenue & Volume
            </button>
            <button
              className={`tab-btn ${activeTab === 'userGrowth' ? 'active' : ''}`}
              onClick={() => setActiveTab('userGrowth')}
            >
              User Registrations
            </button>
            <button
              className={`tab-btn ${activeTab === 'aovTrend' ? 'active' : ''}`}
              onClick={() => setActiveTab('aovTrend')}
            >
              AOV Fluctuation
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
            <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <select
              className="select-field"
              value={timeGroup}
              onChange={e => setTimeGroup(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              <option value="daily">Daily Aggregation</option>
              <option value="weekly">Weekly Aggregation</option>
              <option value="monthly">Monthly Aggregation</option>
            </select>
          </div>
        </div>
      </div>

      <div className="chart-body tall">
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
    </div>
  );
}
