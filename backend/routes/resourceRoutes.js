const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  checkResourceAvailability,
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getResources);
router.get('/:id/availability', checkResourceAvailability);
router.get('/:id', getResourceById);

router.post('/', protect, adminOnly, createResource);
router.put('/:id', protect, adminOnly, updateResource);
router.delete('/:id', protect, adminOnly, deleteResource);

module.exports = router;

