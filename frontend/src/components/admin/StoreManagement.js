import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  useEffect(() => {
    fetchStores();
    fetchUsers();
  }, [searchTerm, sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        sortBy,
        sortOrder
      });

      const response = await axios.get(`/api/stores?${params}`);
      setStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      // toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users.filter(user => user.role === 'store_owner'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store?')) {
      return;
    }

    try {
      await axios.delete(`/api/stores/${storeId}`);
      toast.success('Store deleted successfully');
      fetchStores();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete store';
      toast.error(message);
    }
  };

  if (loading) {
    return <div>Loading stores...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Store Management</h1>
        <button
          className="btn btn-success"
          onClick={() => setShowAddModal(true)}
        >
          Add New Store
        </button>
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
            <option value="average_rating">Average Rating</option>
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
          <p>No stores found. Try adjusting your search criteria.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Address</th>
                  <th>Owner</th>
                  <th>Average Rating</th>
                  <th>Total Ratings</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address}</td>
                    <td>{store.owner_name || 'No owner'}</td>
                    <td>
                      <span style={{ fontWeight: 'bold' }}>
                        {parseFloat(store.average_rating).toFixed(1)}/5
                      </span>
                    </td>
                    <td>{store.total_ratings}</td>
                    <td>{new Date(store.created_at).toLocaleDateString()}</td>
                    <td>
                      {/* <button
                        className="btn btn-warning btn-sm"
                        onClick={() => setEditingStore(store)}
                        style={{ marginRight: '10px' }}
                      >
                        Edit
                      </button> */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteStore(store.id)}
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

      {showAddModal && (
        <AddStoreModal
          users={users}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchStores();
          }}
        />
      )}

      {editingStore && (
        <EditStoreModal
          store={editingStore}
          users={users}
          onClose={() => setEditingStore(null)}
          onSuccess={() => {
            setEditingStore(null);
            fetchStores();
          }}
        />
      )}
    </div>
  );
};

const AddStoreModal = ({ users, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    owner_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/stores', formData);
      toast.success('Store created successfully');
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create store';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
        <h3>Add New Store</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              minLength="20"
              maxLength="60"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-control"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              maxLength="400"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Owner (Optional)</label>
            <select
              className="form-control"
              value={formData.owner_id}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            >
              <option value="">No owner</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditStoreModal = ({ store, users, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: store.name,
    address: store.address,
    owner_id: store.owner_id || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/stores/${store.id}`, formData);
      toast.success('Store updated successfully');
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update store';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
        <h3>Edit Store</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              minLength="20"
              maxLength="60"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-control"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              maxLength="400"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Owner</label>
            <select
              className="form-control"
              value={formData.owner_id}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            >
              <option value="">No owner</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreManagement;
