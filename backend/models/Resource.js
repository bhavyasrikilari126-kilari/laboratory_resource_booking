const mongoose = require('mongoose');

const RESOURCE_CATEGORIES = [
  'Computer Systems',
  'Projectors',
  'Electronic Equipment',
  'Networking Devices',
  'Laboratory Instruments',
  'Software Resources',
  'Other Equipment'
];

const resourceSchema = new mongoose.Schema(
  {
    resourceName: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: RESOURCE_CATEGORIES,
        message: 'Invalid resource category'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    availability: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.index({ resourceName: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
module.exports.RESOURCE_CATEGORIES = RESOURCE_CATEGORIES;

