const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getDashboardStats
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/my-bookings', protect, getMyBookings);
router.post('/', protect, createBooking);
router.patch('/:id/cancel', protect, cancelBooking);

router.get('/', protect, adminOnly, getAllBookings);
router.patch('/:id/status', protect, adminOnly, updateBookingStatus);

module.exports = router;

