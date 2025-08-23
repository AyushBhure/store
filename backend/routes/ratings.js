const express = require('express');
const router = express.Router();
const { validateRating } = require('../middleware/validation');
const { authenticateToken, requireUser } = require('../middleware/auth');
const {
  getAllRatings,
  getRatingsByStore,
  createRating,
  updateRating,
  deleteRating,
  getRatingById
} = require('../controllers/ratingController');

// All routes require authentication
router.use(authenticateToken);

// Get ratings (filtered by role)
router.get('/', getAllRatings);
router.get('/store/:store_id', getRatingsByStore);
router.get('/:id', getRatingById);

// User routes (users can create, update, delete their own ratings)
router.post('/', requireUser, validateRating, createRating);
router.put('/:id', validateRating, updateRating);
router.delete('/:id', deleteRating);

module.exports = router;
