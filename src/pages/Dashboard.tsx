import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

interface Stats {
  users: number;
  plants: number;
  diseases: number;
  scans: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ users: 0, plants: 0, diseases: 0, scans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, plantsRes, diseasesRes, scansRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getPlants(),
        adminAPI.getDiseases(),
        adminAPI.getScans(),
      ]);

      setStats({
        users: usersRes.data?.length || 0,
        plants: plantsRes.data?.length || 0,
        diseases: diseasesRes.data?.length || 0,
        scans: scansRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to LeafLens Admin Panel</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌿</div>
          <div className="stat-info">
            <h3>{stats.plants}</h3>
            <p>Total Plants</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🦠</div>
          <div className="stat-info">
            <h3>{stats.diseases}</h3>
            <p>Total Diseases</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-info">
            <h3>{stats.scans}</h3>
            <p>Total Scans</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-icon">📊</div>
            <div className="activity-info">
              <h4>Scan Analytics</h4>
              <p>{stats.scans} disease scans performed</p>
            </div>
          </div>
          
          <div className="activity-card">
            <div className="activity-icon">👥</div>
            <div className="activity-info">
              <h4>User Management</h4>
              <p>{stats.users} registered users</p>
            </div>
          </div>
          
          <div className="activity-card">
            <div className="activity-icon">🌱</div>
            <div className="activity-info">
              <h4>Plant Database</h4>
              <p>{stats.plants} plant species</p>
            </div>
          </div>
          
          <div className="activity-card">
            <div className="activity-icon">🏥</div>
            <div className="activity-info">
              <h4>Disease Library</h4>
              <p>{stats.diseases} diseases tracked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;