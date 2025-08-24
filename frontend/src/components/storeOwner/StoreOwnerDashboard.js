import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoreOwnerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/stores/owner/dashboard');
      setStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? '' : 'empty'}`}>
          ★
        </span>
      );
    }
    return <div className="rating-stars">{stars}</div>;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await axios.put('/api/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update password');
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const totalStores = stores.length;
  const totalRatings = stores.reduce((sum, store) => sum + parseInt(store.total_ratings), 0);
  const averageRating = stores.length > 0
    ? (stores.reduce((sum, store) => sum + parseFloat(store.average_rating), 0) / stores.length).toFixed(1)
    : 0;

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Store Owner Dashboard</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{totalStores}</div>
          <div className="stat-label">Your Stores</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{totalRatings}</div>
          <div className="stat-label">Total Ratings</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{averageRating}</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>

      <div className="card">
        <h3>Your Stores</h3>
        {stores.length === 0 ? (
          <p>You don't have any stores yet. Contact an administrator to add stores to your account.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Address</th>
                  <th>Average Rating</th>
                  <th>Total Ratings</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address}</td>
                    <td>
                      {renderStars(Math.round(store.average_rating))}
                      <span style={{ marginLeft: '10px' }}>
                        {parseFloat(store.average_rating).toFixed(1)}/5
                      </span>
                    </td>
                    <td>{store.total_ratings}</td>
                    <td>{new Date(store.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3>Store Performance Overview</h3>
        {stores.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {stores.map((store) => (
              <div key={store.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f8f9fa'
              }}>
                <h4 style={{ marginBottom: '10px' }}>{store.name}</h4>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  {store.address}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                      {parseFloat(store.average_rating).toFixed(1)}/5
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {store.total_ratings} ratings
                    </div>
                  </div>
                  <div>
                    {renderStars(Math.round(store.average_rating))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-info"
            onClick={() => window.open('/stores', '_blank')}
          >
            View All Stores
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .modal {
          background: white;
          padding: 20px;
          border-radius: 10px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default StoreOwnerDashboard;
