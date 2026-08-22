import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Filter, Calendar, Search, RefreshCw, Layers, Database, Sparkles, X, Globe } from 'lucide-react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import HistogramsSection from './components/HistogramsSection';
import LineChartsSection from './components/LineChartsSection';
import AdditionalVisualizations from './components/AdditionalVisualizations';
import DataExplorer from './components/DataExplorer';
import ConfigModal from './components/ConfigModal';
import { fetchDashboardData, getStoredCredentials } from './supabaseClient';

export default function App() {
  const [credentials, setCredentials] = useState(getStoredCredentials());
  const [data, setData] = useState({ orders: [], users: [], products: [], destinations: [], errors: {} });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('dashboard_theme') || 'dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Global Filter State
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'last30' | 'last60' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Synchronize document theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dashboard_theme', theme);
  }, [theme]);

  // Fetch data function
  const loadData = useCallback(async (url = credentials.url, key = credentials.key) => {
    setIsSyncing(true);
    try {
      const res = await fetchDashboardData(url, key);
      setData(res);
      setLastSyncTime(new Date());
      
      // Trigger confetti on initial clean load
      if (res.orders.length > 0) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [credentials]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveCredentials = (newUrl, newKey) => {
    localStorage.setItem('supabase_url', newUrl);
    localStorage.setItem('supabase_anon_key', newKey);
    setCredentials({ url: newUrl, key: newKey });
    loadData(newUrl, newKey);
  };

  // Filtered Orders Calculation
  const filteredOrders = useMemo(() => {
    if (!data.orders.length) return [];

    let result = [...data.orders];

    // Filter by Date Range
    if (dateRange !== 'all') {
      const now = new Date('2026-03-31'); // Max date in dataset is late March 2026
      if (dateRange === 'last30') {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 30);
        result = result.filter(o => new Date(o.order_date_time) >= cutoff);
      } else if (dateRange === 'last60') {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 60);
        result = result.filter(o => new Date(o.order_date_time) >= cutoff);
      } else if (dateRange === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        result = result.filter(o => {
          const d = new Date(o.order_date_time);
          return d >= start && d <= end;
        });
      }
    }

    // Filter by Search Query
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(o =>
        String(o.order_no).includes(q) ||
        String(o.user_id).includes(q) ||
        String(o.product_id).includes(q)
      );
    }

    return result;
  }, [data.orders, dateRange, customStartDate, customEndDate, searchFilter]);

  // Unique destinations list for dropdown
  const uniqueDestinations = useMemo(() => {
    return data.destinations.map(d => ({
      id: d.destination_id,
      name: d.destination_name || d.destination_id
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [data.destinations]);

  const totalRecordsCount =
    (data.orders?.length || 0) +
    (data.users?.length || 0) +
    (data.products?.length || 0) +
    (data.destinations?.length || 0);

  const errorCount = Object.values(data.errors || {}).filter(Boolean).length;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">
          <div className="spinner" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Connecting to Supabase Database...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Fetching orders, user accounts, eSIM products, and active destinations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        errorCount={errorCount}
        onRefresh={() => loadData()}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalRecordsCount={totalRecordsCount}
      />

      <main className="dashboard-content">
        {/* Global Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem' }}>
              <Filter className="w-4 h-4" style={{ color: 'var(--accent-indigo)' }} />
              <span>Global Filters:</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <select
                className="select-field"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
              >
                <option value="all">All Dates (Jan - Mar 2026)</option>
                <option value="last30">Last 30 Days</option>
                <option value="last60">Last 60 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="date"
                  className="input-field"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                />
                <span style={{ color: 'var(--text-muted)' }}>to</span>
                <input
                  type="date"
                  className="input-field"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="filter-group">
            <div style={{ position: 'relative' }}>
              <Search
                className="w-4 h-4"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Filter by Order ID or User..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ paddingLeft: '32px', width: '220px' }}
              />
            </div>

            {(dateRange !== 'all' || searchFilter || selectedDestination !== 'all') && (
              <button
                className="btn btn-sm"
                onClick={() => { setDateRange('all'); setSearchFilter(''); setSelectedDestination('all'); }}
                title="Reset all filters"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Executive KPI Summary */}
        <KPICards
          orders={filteredOrders}
          users={data.users}
          products={data.products}
          destinations={data.destinations}
        />

        {/* Histograms Section (User explicitly requested Histogram) */}
        <div className="charts-section-title">
          <div className="section-heading">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
            <span>Distribution Histograms</span>
          </div>
        </div>

        <HistogramsSection
          orders={filteredOrders}
          products={data.products}
          users={data.users}
        />

        {/* Line Charts Section (User explicitly requested Line Chart) */}
        <div className="charts-section-title">
          <div className="section-heading">
            <Layers className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
            <span>Time-Series & Trend Line Visualizations</span>
          </div>
        </div>

        <LineChartsSection
          orders={filteredOrders}
          users={data.users}
        />

        {/* Geographic & Category Visualizations */}
        <AdditionalVisualizations
          orders={filteredOrders}
          products={data.products}
          destinations={data.destinations}
        />

        {/* Interactive Data Table Explorer */}
        <DataExplorer
          orders={filteredOrders}
          users={data.users}
          products={data.products}
          destinations={data.destinations}
        />
      </main>

      <ConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveCredentials={handleSaveCredentials}
        currentUrl={credentials.url}
        currentKey={credentials.key}
      />
    </div>
  );
}
