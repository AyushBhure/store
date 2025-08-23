import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RatingManagement = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [filterStore, setFilterStore] = useState('');
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    fetchRatings();
  }, [sortBy, sortOrder, filterStore, filterUser]);

  const fetchRatings = async () => {
    try {
      const response = await axios.get(`/api/ratings`);
      let data = response.data.ratings;

      if (filterStore) {
        data = data.filter(r =>
          r.store_name.toLowerCase().includes(filterStore.toLowerCase())
        );
      }

      if (filterUser) {
        data = data.filter(r =>
          r.user_name.toLowerCase().includes(filterUser.toLowerCase()) ||
          r.user_email.toLowerCase().includes(filterUser.toLowerCase())
        );
      }

      data.sort((a, b) => {
        if (sortBy === "rating") {
          return sortOrder === "ASC" ? a.rating - b.rating : b.rating - a.rating;
        }
        if (sortBy === "created_at") {
          return sortOrder === "ASC"
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at);
        }
        if (sortBy === "user_name") {
          return sortOrder === "ASC"
            ? a.user_name.localeCompare(b.user_name)
            : b.user_name.localeCompare(a.user_name);
        }
        if (sortBy === "store_name") {
          return sortOrder === "ASC"
            ? a.store_name.localeCompare(b.store_name)
            : b.store_name.localeCompare(a.store_name);
        }
        return 0;
      });

      setRatings(data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      await axios.delete(`/api/ratings/${ratingId}`);
      toast.success('Rating deleted successfully');
      fetchRatings();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete rating';
      toast.error(message);
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

  if (loading) {
    return <div>Loading ratings...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Rating Management</h1>

      <div className="filters">
        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
          >
            <option value="rating">Rating</option>
            <option value="created_at">Date</option>
            <option value="user_name">User</option>
            <option value="store_name">Store</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="form-control"
          >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Store:</label>
          <input
            type="text"
            placeholder="Store name..."
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-group">
          <label>Filter by User:</label>
          <input
            type="text"
            placeholder="User name or email..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="card">
        {ratings.length === 0 ? (
          <p>No ratings found. Try adjusting your filters.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Store</th>
                  <th>Rating</th>
                  {/* <th>Comment</th> */}
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((rating) => (
                  <tr key={rating.id}>
                    <td>
                      <div>
                        <strong>{rating.user_name}</strong>
                        <br />
                        <small style={{ color: '#666' }}>{rating.user_email}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{rating.store_name}</strong>
                        <br />
                        <small style={{ color: '#666' }}>{rating.store_address}</small>
                      </div>
                    </td>
                    <td>
                      {renderStars(rating.rating)}
                      <span style={{ fontWeight: 'bold' }}>
                        {rating.rating}/5
                      </span>
                    </td>
                    {/* <td>
                      {rating.comment ? (
                        <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                          {rating.comment}
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontStyle: 'italic' }}>No comment</span>
                      )}
                    </td> */}
                    <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteRating(rating.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3>Rating Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="stat-card">
            <div className="stat-number">{ratings.length}</div>
            <div className="stat-label">Total Ratings</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {ratings.length > 0
                ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                : 0
              }
            </div>
            <div className="stat-label">Average Rating</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {ratings.filter(r => r.rating >= 4).length}
            </div>
            <div className="stat-label">High Ratings (4-5)</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {ratings.filter(r => r.rating <= 2).length}
            </div>
            <div className="stat-label">Low Ratings (1-2)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingManagement;
