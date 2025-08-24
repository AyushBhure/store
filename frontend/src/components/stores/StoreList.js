import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RatingModal from './RatingModal';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [selectedStore, setSelectedStore] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRatings, setUserRatings] = useState({});

  useEffect(() => {
    fetchStores();
    fetchUserRatings();
  }, [searchTerm, sortBy, sortOrder]);

  const fetchUserRatings = async () => {
    try {
      const response = await axios.get('/api/ratings');
      const ratingsMap = {};
      response.data.ratings.forEach(rating => {
        ratingsMap[rating.store_id] = rating;
      });
      setUserRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      toast.error('Failed to load your ratings'); // Added toast
    }
  };

  const fetchStores = async () => {
    try {
      const response = await axios.get(`/api/stores`);
      let data = response.data.stores;

      if (searchTerm) {
        data = data.filter(store =>
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      data.sort((a, b) => {
        if (sortBy === "name") {
          return sortOrder === "ASC"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        if (sortBy === "address") {
          return sortOrder === "ASC"
            ? a.address.localeCompare(b.address)
            : b.address.localeCompare(a.address);
        }
        if (sortBy === "created_at") {
          return sortOrder === "ASC"
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
      });

      setStores(data);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };


  const handleRateStore = (store) => {
    setSelectedStore({
      ...store,
      userRating: userRatings[store.id]
    });
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      if (userRatings[selectedStore.id]) {
        // Update existing rating
        await axios.put(`/api/ratings/${userRatings[selectedStore.id].id}`, {
          rating: ratingData.rating,
          store_id: selectedStore.id  // Add store_id for validation
        });
        toast.success('Rating updated successfully!');
      } else {
        // Create new rating
        await axios.post('/api/ratings', {
          store_id: selectedStore.id,
          rating: ratingData.rating
        });
        toast.success('Rating submitted successfully!');
      }
      
      setShowRatingModal(false);
      setSelectedStore(null);
      // Refresh both stores and ratings data
      await Promise.all([fetchStores(), fetchUserRatings()]);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to submit rating';
      toast.error(message);
      // Keep modal open on validation errors
      if (error.response?.status !== 400) {
        setShowRatingModal(false);
        setSelectedStore(null);
      }
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
    return (
      <div className="loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>Loading...</div>
          <div>Loading stores...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Store Listings</h1>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search stores by name or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
          >
            <option value="name">Name</option>
            <option value="address">Address</option>
            <option value="created_at">Created Date</option>
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
      </div>

      <div className="card">
        {stores.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>No Stores</div>
            <h3>No stores found</h3>
            <p>Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {/* <th>Store ID</th>  */}
                  <th>Store Name</th>
                  <th>Address</th>
                  <th>Owner</th>
                  <th>Average Rating</th>
                  <th>Your Rating</th>
                  <th>Total Ratings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    {/* <td>{store.id}</td> New data cell */}
                    <td>
                      <strong style={{ color: '#333' }}>{store.name}</strong>
                    </td>
                    <td>{store.address}</td>
                    <td>
                      <span style={{
                        color: store.owner_name ? '#28a745' : '#6c757d',
                        fontWeight: store.owner_name ? '600' : '400'
                      }}>
                        {store.owner_name || 'No owner'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderStars(Math.round(store.average_rating || 0))}
                        <span style={{
                          marginLeft: '8px',
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          {parseFloat(store.average_rating || 0).toFixed(1)}/5
                        </span>
                      </div>
                    </td>
                    <td>
                      {userRatings[store.id] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {renderStars(userRatings[store.id].rating)}
                          <span  style={{
                          marginLeft: '8px',
                          fontWeight: '600',
                          color: '#111827'
                        }}>{userRatings[store.id].rating}/5</span>
                        </div>
                      ) : (
                        'Not rated'
                      )}
                    </td>
                    <td >
                      <span style={{
                        fontWeight: '600',
                        color: '#6c757d'
                      }}>
                        {store.total_ratings || 0}
                      </span>
                    </td>
                    <td>
                      <div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleRateStore(store)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: userRatings[store.id] ? '#15c200' : '#007bff'
                          }}
                        >
                          {userRatings[store.id] ? 'Update Rate' : 'Rate Store'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRatingModal && selectedStore && (
        <RatingModal
          store={selectedStore}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedStore(null);
          }}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default StoreList;
