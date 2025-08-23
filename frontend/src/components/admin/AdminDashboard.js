import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, storesRes, ratingsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/stores'),
        axios.get('/api/ratings')
      ]);

      const totalUsers = usersRes.data.total;
      const totalStores = storesRes.data.total;
      const totalRatings = ratingsRes.data.total;

      // Calculate average rating
      const ratings = ratingsRes.data.ratings;
      const averageRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : 0;

      setStats({
        totalUsers,
        totalStores,
        totalRatings,
        averageRating
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>Loading...</div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.totalStores}</div>
          <div className="stat-label">Total Stores</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.totalRatings}</div>
          <div className="stat-label">Total Ratings</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h3 style={{
            color: '#333',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            User Management
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            Manage users, view profiles, and control access permissions.
          </p>
          <Link to="/admin/users" className="btn btn-primary">
            Manage Users
          </Link>
        </div>

        <div className="card">
          <h3 style={{
            color: '#333',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Store Management
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            Add, edit, and manage store information and ownership.
          </p>
          <Link to="/admin/stores" className="btn btn-primary">
            Manage Stores
          </Link>
        </div>

        <div className="card">
          <h3 style={{
            color: '#333',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Rating Management
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            View and manage all store ratings and user feedback.
          </p>
          <Link to="/admin/ratings" className="btn btn-primary">
            Manage Ratings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
