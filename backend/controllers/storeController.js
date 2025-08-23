const pool = require('../database/connection');

const getAllStores = async (req, res) => {
  try {
    const { sortBy = 'name', sortOrder = 'ASC', search = '' } = req.query;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             u.name as owner_name, u.email as owner_email,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
      GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.name, u.email
    `;
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (s.name ILIKE $${paramCount} OR s.address ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add sorting
    const allowedSortFields = ['name', 'address', 'created_at'];
    const allowedSortOrders = ['ASC', 'DESC'];

    if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY s.name ASC';
    }

    const result = await pool.query(query, params);

    res.json({
      stores: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Failed to get stores' });
  }
};

const getStoresByOwner = async (req, res) => {
  try {
    const { sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.created_at
    `;
    const params = [req.user.id];

    // Add sorting
    const allowedSortFields = ['name', 'address', 'created_at'];
    const allowedSortOrders = ['ASC', 'DESC'];

    if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY s.name ASC';
    }

    const result = await pool.query(query, params);

    res.json({
      stores: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get stores by owner error:', error);
    res.status(500).json({ error: 'Failed to get stores' });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, address, owner_id } = req.body;

    // If owner_id is provided, verify the user exists and is a store owner
    if (owner_id) {
      const ownerCheck = await pool.query('SELECT id, role FROM users WHERE id = $1', [owner_id]);
      if (ownerCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Specified owner does not exist' });
      }
      if (ownerCheck.rows[0].role !== 'store_owner') {
        return res.status(400).json({ error: 'Specified user is not a store owner' });
      }
    }

    // Create store
    const result = await pool.query(`
      INSERT INTO stores (name, email, address, owner_id) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, email, address, owner_id, created_at
    `, [name, `${name.toLowerCase().replace(/\s+/g, '')}@example.com`, address, owner_id || null]);

    res.status(201).json({
      message: 'Store created successfully',
      store: result.rows[0]
    });

  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
};

const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, owner_id } = req.body;

    // Check if store exists
    const existingStore = await pool.query('SELECT id, owner_id FROM stores WHERE id = $1', [id]);
    if (existingStore.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check permissions (only admin or store owner can update)
    if (req.user.role !== 'admin' && existingStore.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // If owner_id is being changed, verify the new owner exists and is a store owner
    if (owner_id && owner_id !== existingStore.rows[0].owner_id) {
      const ownerCheck = await pool.query('SELECT id, role FROM users WHERE id = $1', [owner_id]);
      if (ownerCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Specified owner does not exist' });
      }
      if (ownerCheck.rows[0].role !== 'store_owner') {
        return res.status(400).json({ error: 'Specified user is not a store owner' });
      }
    }

    // Update store
    const result = await pool.query(`
      UPDATE stores 
      SET name = COALESCE($1, name), 
          address = COALESCE($2, address), 
          owner_id = COALESCE($3, owner_id)
      WHERE id = $4 
      RETURNING id, name, email, address, owner_id, created_at
    `, [name, address, owner_id, id]);

    res.json({
      message: 'Store updated successfully',
      store: result.rows[0]
    });

  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
};

const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if store exists
    const existingStore = await pool.query('SELECT id, owner_id FROM stores WHERE id = $1', [id]);
    if (existingStore.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check permissions (only admin or store owner can delete)
    if (req.user.role !== 'admin' && existingStore.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Delete store (cascade will handle related ratings)
    await pool.query('DELETE FROM stores WHERE id = $1', [id]);

    res.json({ message: 'Store deleted successfully' });

  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
};

const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             u.name as owner_name, u.email as owner_email,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.name, u.email
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ store: result.rows[0] });

  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({ error: 'Failed to get store' });
  }
};

module.exports = {
  getAllStores,
  getStoresByOwner,
  createStore,
  updateStore,
  deleteStore,
  getStoreById
};
