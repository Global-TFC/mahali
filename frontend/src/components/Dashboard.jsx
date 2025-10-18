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
    <div className="dashboard">
      <div className="data-section">
        <h2>📊 Dashboard Overview</h2>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{stats.members_count}</h3>
            <p>Members</p>
          </div>
          <div className="stat-card">
            <h3>{stats.houses_count}</h3>
            <p>Houses</p>
          </div>
          <div className="stat-card">
            <h3>{stats.areas_count}</h3>
            <p>Areas</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pending_todos_count}/{stats.todos_count}</h3>
            <p>Pending Todos</p>
          </div>
        </div>
      </div>

      <div className="data-section">
        <h2>👥 Members by Status</h2>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{stats.members_by_status.live}</h3>
            <p>Live</p>
          </div>
          <div className="stat-card">
            <h3>{stats.members_by_status.dead}</h3>
            <p>Deceased</p>
          </div>
          <div className="stat-card">
            <h3>{stats.members_by_status.terminated}</h3>
            <p>Terminated</p>
          </div>
        </div>
      </div>

      <div className="data-section">
        <h2>💰 Obligations by Status</h2>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{stats.obligations_by_status.pending}</h3>
            <p>Pending</p>
          </div>
          <div className="stat-card">
            <h3>{stats.obligations_by_status.paid}</h3>
            <p>Paid</p>
          </div>
          <div className="stat-card">
            <h3>{stats.obligations_by_status.overdue}</h3>
            <p>Overdue</p>
          </div>
          <div className="stat-card">
            <h3>{stats.obligations_by_status.partial}</h3>
            <p>Partial</p>
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