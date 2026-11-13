const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { BOOKING_STATUSES } = require('../models/Booking');

const getTodayDateString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isValidDateFormat = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
const isValidTimeFormat = (timeStr) => /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr);

// @desc    Create a new booking request (with double-booking prevention)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { resourceId, bookingDate, startTime, endTime, purpose } = req.body;

    if (!resourceId || !bookingDate || !startTime || !endTime || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resource, booking date, start time, end time, and purpose.'
      });
    }

    if (!isValidDateFormat(bookingDate)) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in YYYY-MM-DD format.'
      });
    }

    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time must be in HH:mm (24-hour) format.'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be later than start time.'
      });
    }

    const today = getTodayDateString();
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Booking date cannot be in the past.'
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Selected laboratory resource was not found.'
      });
    }

    if (!resource.availability || resource.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This resource is currently unavailable for booking.'
      });
    }

    // Prevent double booking for the same resource, date, and overlapping time window
    const conflictingBooking = await Booking.findOne({
      resourceId,
      bookingDate,
      status: { $in: ['Pending', 'Approved'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: `Double booking prevented: "${resource.resourceName}" already has a ${conflictingBooking.status.toLowerCase()} booking from ${conflictingBooking.startTime} to ${conflictingBooking.endTime} on ${bookingDate}.`
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      resourceId,
      bookingDate,
      startTime,
      endTime,
      purpose: purpose.trim(),
      status: 'Pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email role department')
      .populate('resourceId', 'resourceName category location quantity availability');

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully and is pending approval.',
      data: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = { userId: req.user._id };

    if (status && status !== 'All') {
      filter.status = status;
    }

    let bookings = await Booking.find(filter)
      .populate('resourceId', 'resourceName category location quantity availability')
      .sort({ createdAt: -1 });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      bookings = bookings.filter((b) => {
        const resName = b.resourceId?.resourceName?.toLowerCase() || '';
        const resCat = b.resourceId?.category?.toLowerCase() || '';
        const purpose = b.purpose?.toLowerCase() || '';
        const date = b.bookingDate || '';
        return (
          resName.includes(q) ||
          resCat.includes(q) ||
          purpose.includes(q) ||
          date.includes(q)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel own booking (or admin can cancel)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('resourceId', 'resourceName category location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.'
      });
    }

    if (!['Pending', 'Approved'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status}.`
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all booking requests and reports (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status, category, search, startDate, endDate } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = startDate;
      if (endDate) filter.bookingDate.$lte = endDate;
    }

    let bookings = await Booking.find(filter)
      .populate('userId', 'name email role department')
      .populate('resourceId', 'resourceName category location availability')
      .sort({ createdAt: -1 });

    if (category && category !== 'All') {
      bookings = bookings.filter((b) => b.resourceId?.category === category);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      bookings = bookings.filter((b) => {
        const userName = b.userId?.name?.toLowerCase() || '';
        const userEmail = b.userId?.email?.toLowerCase() || '';
        const dept = b.userId?.department?.toLowerCase() || '';
        const resName = b.resourceId?.resourceName?.toLowerCase() || '';
        const resCat = b.resourceId?.category?.toLowerCase() || '';
        const purpose = b.purpose?.toLowerCase() || '';
        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          dept.includes(q) ||
          resName.includes(q) ||
          resCat.includes(q) ||
          purpose.includes(q)
        );
      });
    }

    const summary = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
      approved: bookings.filter((b) => b.status === 'Approved').length,
      rejected: bookings.filter((b) => b.status === 'Rejected').length,
      cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
      completed: bookings.filter((b) => b.status === 'Completed').length
    };

    res.status(200).json({
      success: true,
      count: bookings.length,
      summary,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve, reject, complete, or update a booking status (Admin)
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${BOOKING_STATUSES.join(', ')}.`
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Re-verify no conflicting approved booking exists before approving
    if (status === 'Approved') {
      const resource = await Resource.findById(booking.resourceId);
      if (!resource || !resource.availability || resource.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve booking because the resource is currently unavailable.'
        });
      }

      const conflictingApproved = await Booking.findOne({
        _id: { $ne: booking._id },
        resourceId: booking.resourceId,
        bookingDate: booking.bookingDate,
        status: 'Approved',
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime }
      });

      if (conflictingApproved) {
        return res.status(409).json({
          success: false,
          message: `Cannot approve: Another approved booking exists from ${conflictingApproved.startTime} to ${conflictingApproved.endTime} on ${booking.bookingDate}.`
        });
      }
    }

    booking.status = status;
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('userId', 'name email role department')
      .populate('resourceId', 'resourceName category location availability');

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for current user or admin
// @route   GET /api/bookings/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalResources, availableResources] = await Promise.all([
      Resource.countDocuments(),
      Resource.countDocuments({ availability: true, quantity: { $gt: 0 } })
    ]);

    if (req.user.role === 'admin') {
      const [
        totalUsers,
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        cancelledBookings,
        completedBookings,
        recentBookings,
        allBookingsPopulated
      ] = await Promise.all([
        User.countDocuments(),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'Pending' }),
        Booking.countDocuments({ status: 'Approved' }),
        Booking.countDocuments({ status: 'Rejected' }),
        Booking.countDocuments({ status: 'Cancelled' }),
        Booking.countDocuments({ status: 'Completed' }),
        Booking.find()
          .populate('userId', 'name email role department')
          .populate('resourceId', 'resourceName category location')
          .sort({ createdAt: -1 })
          .limit(8),
        Booking.find().populate('resourceId', 'category')
      ]);

      const categoryMap = {};
      allBookingsPopulated.forEach((b) => {
        const cat = b.resourceId?.category || 'Other Equipment';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        role: 'admin',
        stats: {
          totalResources,
          availableResources,
          unavailableResources: totalResources - availableResources,
          totalUsers,
          totalBookings,
          pendingBookings,
          approvedBookings,
          rejectedBookings,
          cancelledBookings,
          completedBookings,
          bookingsByCategory: Object.entries(categoryMap).map(([category, count]) => ({
            category,
            count
          }))
        },
        recentBookings
      });
    }

    const userFilter = { userId: req.user._id };
    const [
      myTotalBookings,
      myPending,
      myApproved,
      myRejected,
      myCancelled,
      myCompleted,
      recentBookings
    ] = await Promise.all([
      Booking.countDocuments(userFilter),
      Booking.countDocuments({ ...userFilter, status: 'Pending' }),
      Booking.countDocuments({ ...userFilter, status: 'Approved' }),
      Booking.countDocuments({ ...userFilter, status: 'Rejected' }),
      Booking.countDocuments({ ...userFilter, status: 'Cancelled' }),
      Booking.countDocuments({ ...userFilter, status: 'Completed' }),
      Booking.find(userFilter)
        .populate('resourceId', 'resourceName category location availability')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    res.status(200).json({
      success: true,
      role: req.user.role,
      stats: {
        totalResources,
        availableResources,
        myTotalBookings,
        myPending,
        myApproved,
        myRejected,
        myCancelled,
        myCompleted
      },
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getDashboardStats
};

