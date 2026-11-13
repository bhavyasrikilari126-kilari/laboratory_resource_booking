const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const { RESOURCE_CATEGORIES } = require('../models/Resource');

const getTodayDateString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// @desc    Get all laboratory resources with search and category filters
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res, next) => {
  try {
    const { search, category, availability, sort } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (availability === 'true' || availability === 'available') {
      query.availability = true;
    } else if (availability === 'false' || availability === 'unavailable') {
      query.availability = false;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { resourceName: regex },
        { description: regex },
        { category: regex },
        { location: regex }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'name_asc') sortOption = { resourceName: 1 };
    if (sort === 'name_desc') sortOption = { resourceName: -1 };
    if (sort === 'quantity_desc') sortOption = { quantity: -1 };

    const resources = await Resource.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: resources.length,
      categories: RESOURCE_CATEGORIES,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource by ID along with upcoming booked time slots
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory resource not found.'
      });
    }

    const today = getTodayDateString();
    const upcomingSlots = await Booking.find({
      resourceId: resource._id,
      bookingDate: { $gte: today },
      status: { $in: ['Pending', 'Approved'] }
    })
      .select('bookingDate startTime endTime status')
      .sort({ bookingDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: resource,
      upcomingSlots
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check resource availability for a given date and optional time window
// @route   GET /api/resources/:id/availability
// @access  Public
const checkResourceAvailability = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.query;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory resource not found.'
      });
    }

    const targetDate = date || getTodayDateString();
    const bookedSlots = await Booking.find({
      resourceId: resource._id,
      bookingDate: targetDate,
      status: { $in: ['Pending', 'Approved'] }
    })
      .select('bookingDate startTime endTime status')
      .sort({ startTime: 1 });

    let isSlotAvailable = resource.availability && resource.quantity > 0;
    let conflict = null;

    if (isSlotAvailable && startTime && endTime) {
      if (startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be later than start time.'
        });
      }

      conflict = bookedSlots.find(
        (slot) => slot.startTime < endTime && slot.endTime > startTime
      );
      if (conflict) {
        isSlotAvailable = false;
      }
    }

    res.status(200).json({
      success: true,
      resourceId: resource._id,
      resourceName: resource.resourceName,
      resourceAvailable: resource.availability && resource.quantity > 0,
      date: targetDate,
      isSlotAvailable,
      conflict: conflict || null,
      bookedSlots
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new laboratory resource
// @route   POST /api/resources
// @access  Private/Admin
const createResource = async (req, res, next) => {
  try {
    const { resourceName, category, description, quantity, location, availability } = req.body;

    if (!resourceName || !category || !description || quantity === undefined || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resourceName, category, description, quantity, and location.'
      });
    }

    const parsedQty = Number(quantity);
    if (Number.isNaN(parsedQty) || parsedQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid non-negative number.'
      });
    }

    const parsedAvailability =
      availability === undefined
        ? parsedQty > 0
        : availability === true || availability === 'true' || availability === 'Available';

    const resource = await Resource.create({
      resourceName: resourceName.trim(),
      category,
      description: description.trim(),
      quantity: parsedQty,
      location: location.trim(),
      availability: parsedAvailability
    });

    res.status(201).json({
      success: true,
      message: 'Resource created successfully.',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing laboratory resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory resource not found.'
      });
    }

    const { resourceName, category, description, quantity, location, availability } = req.body;

    if (resourceName !== undefined) resource.resourceName = resourceName.trim();
    if (category !== undefined) resource.category = category;
    if (description !== undefined) resource.description = description.trim();
    if (location !== undefined) resource.location = location.trim();

    if (quantity !== undefined) {
      const parsedQty = Number(quantity);
      if (Number.isNaN(parsedQty) || parsedQty < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a valid non-negative number.'
        });
      }
      resource.quantity = parsedQty;
    }

    if (availability !== undefined) {
      resource.availability =
        availability === true || availability === 'true' || availability === 'Available';
    }

    const updated = await resource.save();

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a laboratory resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory resource not found.'
      });
    }

    // Cancel any open pending bookings referencing this removed resource
    await Booking.updateMany(
      { resourceId: resource._id, status: 'Pending' },
      { $set: { status: 'Cancelled' } }
    );

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  checkResourceAvailability,
  createResource,
  updateResource,
  deleteResource
};

