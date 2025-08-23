const pool = require('../database/connection');

const getAllRatings = async (req, res) => {
  try {
    const { sortBy = 'created_at', sortOrder = 'DESC', store_id, user_id } = req.query;

    let query = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             u.name as user_name, u.email as user_email,
             s.name as store_name, s.address as store_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add filters based on user role
    if (req.user.role === 'store_owner') {
      paramCount++;
      query += ` AND s.owner_id = $${paramCount}`;
      params.push(req.user.id);
    } else if (req.user.role === 'user') {
      paramCount++;
      query += ` AND r.user_id = $${paramCount}`;
      params.push(req.user.id);
    }

    // Add store filter
    if (store_id) {
      paramCount++;
      query += ` AND r.store_id = $${paramCount}`;
      params.push(store_id);
    }

    // Add user filter (admin only)
    if (user_id && req.user.role === 'admin') {
      paramCount++;
      query += ` AND r.user_id = $${paramCount}`;
      params.push(user_id);
    }

    // Add sorting
    const allowedSortFields = ['rating', 'created_at', 'updated_at', 'user_name', 'store_name'];
    const allowedSortOrders = ['ASC', 'DESC'];

    if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY r.created_at DESC';
    }

    const result = await pool.query(query, params);

    res.json({
      ratings: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Failed to get ratings' });
  }
};

const getRatingsByStore = async (req, res) => {
  try {
    const { store_id } = req.params;
    const { sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    // Check if store exists and user has access
    const storeCheck = await pool.query(`
      SELECT s.id, s.owner_id 
      FROM stores s 
      WHERE s.id = $1
    `, [store_id]);

    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check permissions for store owners
    if (req.user.role === 'store_owner' && storeCheck.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const query = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
    `;

    const result = await pool.query(query, [store_id]);

    res.json({
      ratings: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get ratings by store error:', error);
    res.status(500).json({ error: 'Failed to get ratings' });
  }
};

const createRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;

    // Check if store exists
    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [store_id]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user already rated this store
    const existingRating = await pool.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [req.user.id, store_id]
    );

    if (existingRating.rows.length > 0) {
      return res.status(400).json({ error: 'You have already rated this store' });
    }

    // Create rating
    const result = await pool.query(`
      INSERT INTO ratings (user_id, store_id, rating) 
      VALUES ($1, $2, $3) 
      RETURNING id, rating, created_at
    `, [req.user.id, store_id, rating]);

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: result.rows[0]
    });

  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Check if rating exists and user has permission to update it
    const existingRating = await pool.query(`
      SELECT r.id, r.user_id, r.store_id, s.owner_id
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.id = $1
    `, [id]);

    if (existingRating.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Check permissions (user can update their own rating, admin can update any)
    if (req.user.role !== 'admin' && existingRating.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Update rating
    const result = await pool.query(`
      UPDATE ratings 
      SET rating = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING id, rating, updated_at
    `, [rating, id]);

    res.json({
      message: 'Rating updated successfully',
      rating: result.rows[0]
    });

  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
};

const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if rating exists and user has permission to delete it
    const existingRating = await pool.query(`
      SELECT r.id, r.user_id, r.store_id, s.owner_id
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.id = $1
    `, [id]);

    if (existingRating.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Check permissions (user can delete their own rating, admin can delete any)
    if (req.user.role !== 'admin' && existingRating.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Delete rating
    await pool.query('DELETE FROM ratings WHERE id = $1', [id]);

    res.json({ message: 'Rating deleted successfully' });

  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
};

const getRatingById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             u.name as user_name, u.email as user_email,
             s.name as store_name, s.address as store_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Check permissions
    const rating = result.rows[0];
    if (req.user.role !== 'admin' && rating.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    res.json({ rating });

  } catch (error) {
    console.error('Get rating by ID error:', error);
    res.status(500).json({ error: 'Failed to get rating' });
  }
};

module.exports = {
  getAllRatings,
  getRatingsByStore,
  createRating,
  updateRating,
  deleteRating,
  getRatingById
};
