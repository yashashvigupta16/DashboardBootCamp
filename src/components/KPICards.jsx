import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Users, Globe, Tag } from 'lucide-react';

export default function KPICards({ orders = [], users = [], products = [], destinations = [] }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + (Number(o.discount_amount) || 0), 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const totalUsers = users.length;
  const totalProducts = products.length;
  const activeDestinations = destinations.filter(d => d.is_active === 1 || d.is_active === true).length || destinations.length;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="kpi-grid">
      <div className="kpi-card" style={{ '--card-accent': 'var(--gradient-cyan-indigo)' }}>
        <div className="kpi-header">
          <span className="kpi-title">Gross Revenue</span>
          <div className="kpi-icon" style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.12)' }}>
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="kpi-value">{formatCurrency(totalRevenue)}</div>
        <div className="kpi-footer">
          <span className="kpi-trend positive">
            <TrendingUp className="w-3 h-3" /> +14.2%
          </span>
          <span>vs previous period</span>
        </div>
      </div>

      <div className="kpi-card" style={{ '--card-accent': 'var(--gradient-brand)' }}>
        <div className="kpi-header">
          <span className="kpi-title">Total Orders</span>
          <div className="kpi-icon" style={{ color: 'var(--accent-indigo)', background: 'rgba(99, 102, 241, 0.12)' }}>
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="kpi-value">{totalOrders.toLocaleString()}</div>
        <div className="kpi-footer">
          <span className="kpi-trend positive">+8.4%</span>
          <span>Completed purchases</span>
        </div>
      </div>

      <div className="kpi-card" style={{ '--card-accent': 'var(--gradient-emerald-teal)' }}>
        <div className="kpi-header">
          <span className="kpi-title">Average Order Value</span>
          <div className="kpi-icon" style={{ color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.12)' }}>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="kpi-value">{formatCurrency(aov)}</div>
        <div className="kpi-footer">
          <span className="kpi-trend neutral">Avg ticket</span>
          <span>per customer order</span>
        </div>
      </div>

      <div className="kpi-card" style={{ '--card-accent': 'var(--gradient-amber-rose)' }}>
        <div className="kpi-header">
          <span className="kpi-title">Total Users</span>
          <div className="kpi-icon" style={{ color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.12)' }}>
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="kpi-value">{totalUsers.toLocaleString()}</div>
        <div className="kpi-footer">
          <span className="kpi-trend positive">+18 new today</span>
          <span>Registered profiles</span>
        </div>
      </div>

      <div className="kpi-card" style={{ '--card-accent': 'var(--accent-purple)' }}>
        <div className="kpi-header">
          <span className="kpi-title">Destinations & Plans</span>
          <div className="kpi-icon" style={{ color: 'var(--accent-purple)', background: 'rgba(168, 85, 247, 0.12)' }}>
            <Globe className="w-5 h-5" />
          </div>
        </div>
        <div className="kpi-value">{activeDestinations} Countries</div>
        <div className="kpi-footer">
          <span>Across {totalProducts} eSIM Plans</span>
        </div>
      </div>

      <div className="kpi-card" style={{ '--card-accent': 'var(--accent-rose)' }}>
        <div className="kpi-header">
          <span className="kpi-title">Total Discounts</span>
          <div className="kpi-icon" style={{ color: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.12)' }}>
            <Tag className="w-5 h-5" />
          </div>
        </div>
        <div className="kpi-value">{formatCurrency(totalDiscount)}</div>
        <div className="kpi-footer">
          <span>Savings passed to users</span>
        </div>
      </div>
    </div>
  );
}
