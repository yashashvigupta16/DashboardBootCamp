import React from 'react';
import { Database, RefreshCw, Sun, Moon, Settings, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Header({
  isSyncing,
  lastSyncTime,
  errorCount,
  onRefresh,
  theme,
  onToggleTheme,
  onOpenSettings,
  totalRecordsCount
}) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <div className="brand-title">Supabase Live Analytics</div>
          <div className="brand-subtitle">
            Project: <code style={{ color: 'var(--accent-cyan)' }}>auoojoyaadwjavkjmwcj</code>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <div className={`status-pill ${isSyncing ? 'syncing' : errorCount > 0 ? 'error' : ''}`}>
          <div className="pulse-dot" />
          <span>
            {isSyncing
              ? 'Fetching Live Data...'
              : errorCount > 0
              ? 'Sync Warning'
              : `Connected (${totalRecordsCount.toLocaleString()} Records)`}
          </span>
        </div>

        {lastSyncTime && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Updated: {lastSyncTime.toLocaleTimeString()}
          </span>
        )}

        <button
          className="btn btn-sm"
          onClick={onRefresh}
          disabled={isSyncing}
          title="Refresh Data from Supabase"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>

        <button
          className="btn btn-icon"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          className="btn btn-icon"
          onClick={onOpenSettings}
          title="Supabase API Settings & Keys"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
