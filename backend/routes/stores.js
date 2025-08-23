const express = require('express');
const router = express.Router();
const { validateStore } = require('../middleware/validation');
const { authenticateToken, requireAdmin, requireStoreOwner } = require('../middleware/auth');
const {
  getAllStores,
  getStoresByOwner,
  createStore,
  updateStore,
  deleteStore,
  getStoreById
} = require('../controllers/storeController');

// Public route (no authentication required)
router.get('/', getAllStores);
router.get('/:id', getStoreById);

// Protected routes
router.use(authenticateToken);

// Admin routes
router.post('/', requireAdmin, validateStore, createStore);
router.put('/:id', validateStore, updateStore);
router.delete('/:id', deleteStore);

// Store owner routes
router.get('/owner/dashboard', requireStoreOwner, getStoresByOwner);

module.exports = router;
