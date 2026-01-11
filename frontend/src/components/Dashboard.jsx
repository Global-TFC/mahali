import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import Todos from './Todos';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="dashboard animate-in">
      <div className="data-section">
        <div className="section-header">
          <h2>
            <div className="header-icon-wrapper">
              📊
            </div>
            Overview
          </h2>
        </div>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{stats.members_count}</h3>
            <p>Total Members</p>
          </div>
          <div className="stat-card">
            <h3>{stats.houses_count}</h3>
            <p>Total Houses</p>
          </div>
          <div className="stat-card">
            <h3>{stats.areas_count}</h3>
            <p>Managed Areas</p>
          </div>
          <div className="stat-card">
            <h3 className="text-primary">{stats.pending_todos_count}/{stats.todos_count}</h3>
            <p>Tasks Pending</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="data-section">
          <div className="section-header">
            <h2>
              <div className="header-icon-wrapper" style={{ background: 'var(--header-bg)' }}>
                👥
              </div>
              Member Metrics
            </h2>
          </div>
          <div className="dashboard-stats compact">
            <div className="stat-card minimal">
              <span className="badge-primary">{stats.members_by_status.live}</span>
              <p>Live</p>
            </div>
            <div className="stat-card minimal">
              <span className="badge-outline">{stats.members_by_status.dead}</span>
              <p>Deceased</p>
            </div>
            <div className="stat-card minimal">
              <span className="badge-outline" style={{ opacity: 0.6 }}>{stats.members_by_status.terminated}</span>
              <p>Terminated</p>
            </div>
          </div>
        </div>

        <div className="data-section">
          <div className="section-header">
            <h2>
              <div className="header-icon-wrapper" style={{ background: 'var(--accent-gradient)' }}>
                💰
              </div>
              Financial Pulse
            </h2>
          </div>
          <div className="dashboard-stats compact">
            <div className="stat-card minimal">
              <span className="badge-primary">{stats.obligations_by_status.paid}</span>
              <p>Paid</p>
            </div>
            <div className="stat-card minimal">
              <span className="badge-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }}>{stats.obligations_by_status.pending}</span>
              <p>Pending</p>
            </div>
            <div className="stat-card minimal">
              <span className="badge-outline" style={{ color: '#f59e0b', borderColor: '#f59e0b' }}>{stats.obligations_by_status.overdue}</span>
              <p>Overdue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="data-section">
        <Todos />
      </div>
    </div>
  );
};

export default Dashboard;