const express = require('express');
const router = express.Router();
const { validateUser } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById
} = require('../controllers/userController');

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

router.get('/', getAllUsers);
router.post('/', validateUser, createUser);
router.get('/:id', getUserById);
router.put('/:id', validateUser, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
