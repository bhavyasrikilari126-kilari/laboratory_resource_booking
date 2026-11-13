const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

