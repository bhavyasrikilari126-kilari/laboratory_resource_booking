const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all registered users with booking counts (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role.toLowerCase();
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { department: regex }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    const bookingCounts = await Booking.aggregate([
      { $group: { _id: '$userId', totalBookings: { $sum: 1 } } }
    ]);

    const countMap = {};
    bookingCounts.forEach((item) => {
      if (item._id) countMap[item._id.toString()] = item.totalBookings;
    });

    const usersWithCounts = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      createdAt: u.createdAt,
      totalBookings: countMap[u._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: usersWithCounts.length,
      data: usersWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or department (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, role, department } = req.body;
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (req.params.id === req.user._id.toString() && role && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote your own administrator account.'
      });
    }

    if (name !== undefined) user.name = name.trim();
    if (department !== undefined) user.department = department.trim();
    if (role !== undefined && ['student', 'faculty', 'admin'].includes(role)) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own logged-in administrator account.'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Cancel pending/approved future bookings belonging to removed user
    await Booking.updateMany(
      { userId: user._id, status: { $in: ['Pending', 'Approved'] } },
      { $set: { status: 'Cancelled' } }
    );

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser
};

