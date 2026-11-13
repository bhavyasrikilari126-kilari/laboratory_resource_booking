const mongoose = require('mongoose');

const BOOKING_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Cancelled',
  'Completed'
];

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Resource ID is required']
  },
  bookingDate: {
    type: String,
    required: [true, 'Booking date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Booking date must be in YYYY-MM-DD format']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:mm format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:mm format']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    minlength: [3, 'Purpose must be at least 3 characters']
  },
  status: {
    type: String,
    enum: {
      values: BOOKING_STATUSES,
      message: 'Invalid booking status'
    },
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.index({ resourceId: 1, bookingDate: 1, status: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;

