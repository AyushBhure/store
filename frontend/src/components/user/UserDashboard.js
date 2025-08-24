import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const [userRatings, setUserRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUserRatings();
  }, []);

  const fetchUserRatings = async () => {
    try {
      const response = await axios.get('/api/ratings');
      setUserRatings(response.data.ratings);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
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

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>User Dashboard</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{userRatings.length}</div>
          <div className="stat-label">Your Ratings</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">
            {userRatings.length > 0
              ? (userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length).toFixed(1)
              : 0}
          </div>
          <div className="stat-label">Average Rating Given</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        <div className="card">
          <h3>Browse Stores</h3>
          <p>Discover and rate stores in your area.</p>
          <Link to="/stores" className="btn btn-primary">
            View Stores
          </Link>
        </div>

        <div className="card">
          <h3>Your Ratings</h3>
          <p>View and manage your store ratings.</p>
          <Link to="/stores" className="btn btn-secondary">
            Manage Ratings
          </Link>
        </div>
      </div>

      <div className="card">
        <h3>Your Recent Ratings</h3>
        {userRatings.length === 0 ? (
          <p>
            You haven't rated any stores yet. <Link to="/stores">Start exploring stores</Link> to leave your first rating!
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Address</th>
                  <th>Your Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {userRatings.slice(0, 5).map((rating) => (
                  <tr key={rating.id}>
                    <td>{rating.store_name}</td>
                    <td>{rating.store_address}</td>
                    <td>{renderStars(rating.rating)}</td>
                    <td>{rating.comment || 'No comment'}</td>
                    <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {userRatings.length > 5 && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/stores" className="btn btn-secondary">
              View All Your Ratings
            </Link>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Link to="/stores" className="btn btn-success">
            Browse Stores
          </Link>
          <Link to="/stores" className="btn btn-info">
            Rate a Store
          </Link>
          <button className="btn btn-warning" onClick={() => setShowPasswordModal(true)}>
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

export default UserDashboard;
