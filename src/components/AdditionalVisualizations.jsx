import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Globe, PieChart, Tag, Award } from 'lucide-react';
import '../utils/chartConfig';

export default function AdditionalVisualizations({ orders = [], products = [], destinations = [] }) {
  // 1. Top Destinations Performance
  const topDestinationsData = useMemo(() => {
    if (!orders.length || !products.length) return { labels: [], data: [], flags: [] };

    // Create lookup from product_id to coverageDestinations
    const prodMap = {};
    products.forEach(p => {
      prodMap[p.prod_id] = p.coverageDestinations || p.allocatedDestinations || 'Other';
    });

    const destMap = {};
    destinations.forEach(d => {
      destMap[d.destination_id] = d.destination_name || d.destination_id;
    });

    const destRevenue = {};
    orders.forEach(o => {
      const destCode = prodMap[o.product_id] || 'Unknown';
      const primaryDest = destCode.split(',')[0].trim();
      const destName = destMap[primaryDest] || primaryDest;

      destRevenue[destName] = (destRevenue[destName] || 0) + (Number(o.amount) || 0);
    });

    const sorted = Object.entries(destRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      labels: sorted.map(item => item[0]),
      data: sorted.map(item => Math.round(item[1]))
    };
  }, [orders, products, destinations]);

  // 2. SIM Mode Distribution
  const simModeDistribution = useMemo(() => {
    if (!products.length) return { labels: [], data: [] };

    const modeMap = {
      'eSIM (Digital)': 0,
      'Physical SIM': 0,
      'Dual Mode': 0,
      'Other': 0
    };

    products.forEach(p => {
      const mode = p.simMode;
      if (mode === 2 || mode === '2') modeMap['eSIM (Digital)']++;
      else if (mode === 1 || mode === '1') modeMap['Physical SIM']++;
      else if (mode === 3 || mode === '3') modeMap['Dual Mode']++;
      else modeMap['Other']++;
    });

    return {
      labels: Object.keys(modeMap),
      data: Object.values(modeMap)
    };
  }, [products]);

  const destBarData = {
    labels: topDestinationsData.labels,
    datasets: [
      {
        label: 'Gross Sales Revenue ($)',
        data: topDestinationsData.data,
        backgroundColor: [
          '#3b82f6', '#06b6d4', '#10b981', '#6366f1',
          '#a855f7', '#f59e0b', '#ec4899', '#f43f5e'
        ],
        borderRadius: 6,
        borderWidth: 0
      }
    ]
  };

  const destBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        callbacks: {
          label: (ctx) => ` Revenue: $${ctx.parsed.x.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'var(--text-muted)' }
      },
      y: {
        grid: { display: false },
        ticks: { color: 'var(--text-secondary)', font: { weight: '600' } }
      }
    }
  };

  const doughnutData = {
    labels: simModeDistribution.labels,
    datasets: [
      {
        data: simModeDistribution.data,
        backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
        borderWidth: 2,
        borderColor: 'var(--bg-secondary)'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-secondary)',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="charts-grid">
      <div className="chart-card col-8">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              <Globe className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
              <span>Top Destination Revenue Leaders</span>
              <span className="badge badge-emerald">Geographic Breakdown</span>
            </div>
            <div className="chart-subtitle">
              Highest grossing countries and regional packages across completed eSIM orders.
            </div>
          </div>
        </div>
        <div className="chart-body">
          <Bar data={destBarData} options={destBarOptions} />
        </div>
      </div>

      <div className="chart-card col-4">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              <PieChart className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
              <span>SIM Hardware Mode</span>
            </div>
            <div className="chart-subtitle">
              Digital eSIM vs Physical SIM catalog proportion.
            </div>
          </div>
        </div>
        <div className="chart-body">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}
