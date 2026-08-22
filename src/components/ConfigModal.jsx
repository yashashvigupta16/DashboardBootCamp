import React, { useState } from 'react';
import { X, Key, Database, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../supabaseClient';

export default function ConfigModal({ isOpen, onClose, onSaveCredentials, currentUrl, currentKey }) {
  const [url, setUrl] = useState(currentUrl || DEFAULT_SUPABASE_URL);
  const [key, setKey] = useState(currentKey || DEFAULT_SUPABASE_ANON_KEY);
  const [saveStatus, setSaveStatus] = useState(null);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveCredentials(url.trim(), key.trim());
    setSaveStatus('Credentials updated!');
    setTimeout(() => {
      setSaveStatus(null);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setUrl(DEFAULT_SUPABASE_URL);
    setKey(DEFAULT_SUPABASE_ANON_KEY);
    onSaveCredentials(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
    setSaveStatus('Reset to original Supabase instance');
    setTimeout(() => setSaveStatus(null), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Database className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
            <span>Supabase Connection Settings</span>
          </div>
          <button className="btn btn-icon btn-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
              Supabase Project URL
            </label>
            <input
              type="text"
              className="input-field"
              value={url}
              onChange={e => setUrl(e.target.value)}
              style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
              Supabase Anon / Public API Key (JWT)
            </label>
            <textarea
              className="input-field"
              value={key}
              onChange={e => setKey(e.target.value)}
              rows={4}
              style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.775rem', resize: 'vertical' }}
              required
            />
          </div>

          {saveStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
              <Check className="w-4 h-4" />
              <span>{saveStatus}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <button type="button" className="btn btn-sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              <span>Reset Defaults</span>
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary">
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
