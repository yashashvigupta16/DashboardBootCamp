import React, { useState, useMemo } from 'react';
import { Table, Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, Layers, User, Package, MapPin } from 'lucide-react';

export default function DataExplorer({ orders = [], users = [], products = [], destinations = [] }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'users' | 'products' | 'destinations'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Switch tab resets pagination and search
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSortField('');
    setCurrentPage(1);
  };

  // Get current dataset based on active tab
  const rawDataset = useMemo(() => {
    switch (activeTab) {
      case 'users': return users;
      case 'products': return products;
      case 'destinations': return destinations;
      default: return orders;
    }
  }, [activeTab, orders, users, products, destinations]);

  // Filtered & Sorted dataset
  const processedData = useMemo(() => {
    let result = [...rawDataset];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(row => {
        return Object.values(row).some(val =>
          String(val || '').toLowerCase().includes(q)
        );
      });
    }

    // Sort filter
    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rawDataset, searchQuery, sortField, sortDirection]);

  // Pagination slice
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!processedData.length) return;
    const headers = Object.keys(processedData[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    processedData.forEach(row => {
      const values = headers.map(h => {
        const escaped = String(row[h] || '').replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${activeTab}_export_${new Date().toISOString().substring(0, 10)}.csv`);
    a.click();
  };

  return (
    <div className="table-card col-12">
      <div className="table-tabs">
        <button
          className={`table-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          <Layers className="w-4 h-4" />
          <span>Orders ({orders.length.toLocaleString()})</span>
        </button>

        <button
          className={`table-tab-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          <User className="w-4 h-4" />
          <span>Users ({users.length.toLocaleString()})</span>
        </button>

        <button
          className={`table-tab-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleTabChange('products')}
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length.toLocaleString()})</span>
        </button>

        <button
          className={`table-tab-item ${activeTab === 'destinations' ? 'active' : ''}`}
          onClick={() => handleTabChange('destinations')}
        >
          <MapPin className="w-4 h-4" />
          <span>Destinations ({destinations.length.toLocaleString()})</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div className="filter-group" style={{ flex: 1 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search
              className="w-4 h-4"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="input-field"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rows per page:</label>
          <select
            className="select-field"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          <button className="btn btn-sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        {paginatedData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching records found.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                {Object.keys(paginatedData[0]).map(key => (
                  <th key={key} onClick={() => handleSort(key)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{key}</span>
                      <ArrowUpDown className="w-3 h-3" style={{ opacity: sortField === key ? 1 : 0.4 }} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={idx}>
                  {Object.entries(row).map(([k, v], cIdx) => (
                    <td key={cIdx}>
                      {k === 'flag_path' && typeof v === 'string' && v.startsWith('http') ? (
                        <img src={v} alt="flag" style={{ width: '24px', height: '16px', borderRadius: '2px', objectFit: 'cover' }} />
                      ) : k === 'amount' || k === 'discount_amount' ? (
                        <span style={{ fontWeight: '600', color: k === 'amount' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          ${Number(v || 0).toFixed(2)}
                        </span>
                      ) : k.includes('date') || k.includes('Time') ? (
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                          {String(v)}
                        </span>
                      ) : (
                        String(v === null || v === undefined ? '—' : v)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-pagination">
        <div>
          Showing {processedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length.toLocaleString()} entries
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-sm btn-icon"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span style={{ fontWeight: '600', padding: '0 8px' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn btn-sm btn-icon"
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
