import express from 'express';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import {
  getDeviceStatus,
  getDeviceLogs,
  getDeviceShadowProperties
} from '../controllers/deviceController.js';

const router = express.Router();

// ==================== CHECK ROOM AVAILABILITY ====================
// MUST BE DEFINED BEFORE GENERIC /:id ROUTE
// Check if a room is available for a specific date range
router.get('/check-availability/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    // Validate input
    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters',
        data: null
      });
    }

    // Parse and validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkIn >= checkOut) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date range',
        data: null
      });
    }

    // Calculate number of nights
    const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Verify room exists
    const room = await Room.findById(roomId).populate('hotel', 'name');
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found',
        data: null
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.countDocuments({
      room: roomId,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn }
        }
      ]
    });

    const isAvailable = conflictingBookings === 0;

    res.status(200).json({
      status: 'success',
      data: {
        roomId,
        isAvailable,
        numberOfNights,
        conflictingBookings,
        message: isAvailable
          ? `Room is available for ${numberOfNights} night(s)`
          : `Room is already booked for these dates`
      }
    });
  } catch (err) {
    console.error('Availability check error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check availability',
      data: { isAvailable: true, numberOfNights: 1 }  // Return available on error as fallback
    });
  }
});

// ==================== PUBLIC SEARCH ENDPOINT ====================
// MUST BE DEFINED BEFORE GENERIC /:id ROUTE
// Search public hotels (for customers browsing available hotels)
router.get('/public/search', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      location,
      minRating = 0,
      amenities,
      propertyTypes
    } = req.query;

    console.log('🔍 Public hotel search requested:', { page, limit, location, minRating, amenities, propertyTypes });

    // Build filter for active hotels only
    let filter = { isActive: true };

    // Location filter (city or address)
    if (location) {
      filter.$or = [
        { city: { $regex: location, $options: 'i' } },
        { address: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } },
        { name: { $regex: location, $options: 'i' } }
      ];
    }

    // Rating filter
    if (minRating > 0) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Amenities filter
    if (amenities) {
      const amenityArray = typeof amenities === 'string' ? amenities.split(',') : [amenities];
      filter.amenities = { $in: amenityArray };
    }

    // Property type filter
    if (propertyTypes) {
      const typeArray = typeof propertyTypes === 'string' ? propertyTypes.split(',') : [propertyTypes];
      filter.type = { $in: typeArray };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch hotels
    const hotels = await Hotel.find(filter)
      .populate('owner', 'name email phone')
      .limit(limit * 1)
      .skip(skip)
      .sort({ rating: -1, createdAt: -1 });

    const total = await Hotel.countDocuments(filter);

    console.log(`✅ Found ${hotels.length} hotels out of ${total} total`);

    // Transform data for frontend - fetch rooms and calculate price
    const transformedHotels = await Promise.all(
      hotels.map(async (hotel) => {
        // Fetch rooms for this hotel to get pricing
        const rooms = await Room.find({ hotel: hotel._id });

        // Calculate base price (minimum room price) or use existing basePrice
        let price = hotel.basePrice || 0;
        if (rooms.length > 0) {
          const minPrice = Math.min(...rooms.map(r => r.discountedPrice || r.pricePerNight));
          price = minPrice;
        }

        const hotelObj = hotel.toObject();

        const transformedHotel = {
          ...hotelObj,
          id: hotel._id,
          reviews: hotel.reviewsCount || 0,
          icon: '🏨',
          price,
          // CRITICAL: Ensure contactlessCheckInEnabled is always included
          // It must come AFTER spread to override any existing value
          contactlessCheckInEnabled: (hotel.contactlessCheckInEnabled === true),
          rooms: rooms.map(room => ({
            id: room._id,
            type: room.roomType,
            bedType: room.bedType || 'Standard',
            capacity: room.capacity,
            price: room.discountedPrice || room.pricePerNight,
            originalPrice: room.pricePerNight,
            maxGuests: room.capacity,
            amenities: room.amenities || [],
            rating: 4.0,
            reviews: 0,
            icon: '🛏️',
            images: room.images || []
          }))
        };

        console.log(`✅ ${hotel.name} - contactlessCheckInEnabled: ${transformedHotel.contactlessCheckInEnabled}`);
        return transformedHotel;
      })
    );

    console.log('📊 Transformed hotels:', transformedHotels.map(h => ({ name: h.name, contactlessCheckInEnabled: h.contactlessCheckInEnabled })));

    res.status(200).json({
      status: 'success',
      data: transformedHotels,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (err) {
    console.error('Error in public hotel search:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error', error: err.message });
  }
});

// Get all hotels
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const skip = (page - 1) * limit;
    const hotels = await Hotel.find(filter)
      .populate('owner', 'name email')
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Hotel.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: hotels,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Get hotel by ID or owner (userId)
router.get('/:id', async (req, res) => {
  try {
    const searchId = req.params.id;
    console.log('🏨 Fetching hotel with ID/userId:', searchId);

    let hotel;

    // First try to find by Hotel _id
    try {
      hotel = await Hotel.findById(searchId).populate('owner', 'name email phone');
      if (hotel) {
        console.log('✅ Hotel found by ID:', hotel._id);
        return res.status(200).json({ status: 'success', data: hotel });
      }
    } catch (err) {
      // If findById fails, it means it's not a valid MongoDB ID
    }

    // If not found by ID, try to find by owner (userId)
    console.log('🔍 Hotel not found by ID, searching by owner (userId)...');
    hotel = await Hotel.findOne({ owner: searchId }).populate('owner', 'name email phone');

    if (!hotel) {
      console.log('⚠️ Hotel not found for ID or owner:', searchId);
      return res.status(404).json({
        status: 'failed',
        message: 'Hotel not found',
        searchedId: searchId
      });
    }

    console.log('✅ Hotel found by owner:', hotel._id, hotel.name);
    res.status(200).json({ status: 'success', data: hotel });
  } catch (err) {
    console.error('❌ Error fetching hotel:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: err.message
    });
  }
});

// Create hotel
router.post('/', async (req, res) => {
  try {
    const { name, owner, ...rest } = req.body;

    if (!name || !owner) {
      return res.status(400).json({ status: 'failed', message: 'Missing required fields' });
    }

    const hotel = new Hotel({
      name,
      owner,
      ...rest
    });

    await hotel.save();
    await hotel.populate('owner', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Hotel created successfully',
      data: hotel
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Update hotel
router.put('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('owner', 'name email');

    if (!hotel) return res.status(404).json({ status: 'failed', message: 'Hotel not found' });

    res.status(200).json({
      status: 'success',
      message: 'Hotel updated successfully',
      data: hotel
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Delete hotel
router.delete('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) return res.status(404).json({ status: 'failed', message: 'Hotel not found' });

    res.status(200).json({
      status: 'success',
      message: 'Hotel deleted successfully',
      data: hotel
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// ==================== TUYA DEVICE ROUTES ====================

// Get device status for a specific hotel
// GET /hotels/:hotelId/devices/:deviceId/status
router.get('/:hotelId/devices/:deviceId/status', getDeviceStatus);

// Get device logs for a specific hotel
// GET /hotels/:hotelId/devices/:deviceId/logs?start_time=xxx&end_time=xxx&codes=xxx
router.get('/:hotelId/devices/:deviceId/logs', getDeviceLogs);

// Get device shadow properties for a specific hotel
// GET /hotels/:hotelId/devices/:deviceId/shadow
router.get('/:hotelId/devices/:deviceId/shadow', getDeviceShadowProperties);

// ==================== HOTEL BOOKINGS ====================

// Get all bookings for a hotel
// GET /hotels/:hotelId/bookings?page=1&limit=10&status=confirmed
router.get('/:hotelId/bookings', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    console.log('📋 Fetching bookings for hotel:', hotelId);

    // Validate hotelId is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid hotel ID',
        data: null
      });
    }

    // Build filter
    let filter = {};

    // Get all rooms for this hotel
    const rooms = await Room.find({ hotel: hotelId }).select('_id');
    const roomIds = rooms.map(r => r._id);

    if (roomIds.length === 0) {
      // No rooms for this hotel, return empty bookings
      return res.status(200).json({
        status: 'success',
        data: [],
        pagination: {
          total: 0,
          pages: 0,
          currentPage: parseInt(page)
        }
      });
    }

    // Filter bookings by rooms in this hotel
    filter.room = { $in: roomIds };

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Booking.countDocuments(filter);

    // Fetch bookings with populated references
    const rawBookings = await Booking.find(filter)
      .populate({
        path: 'room',
        select: 'roomType roomNumber bedType price',
        strictPopulate: false
      })
      .populate({
        path: 'guest',
        select: 'name email phone',
        strictPopulate: false
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    console.log('✅ Found', rawBookings.length, 'bookings for hotel:', hotelId);

    // Log first booking for debugging
    if (rawBookings.length > 0) {
      console.log('📍 First booking details:', {
        _id: rawBookings[0]._id,
        guest: rawBookings[0].guest,
        room: rawBookings[0].room,
        status: rawBookings[0].status,
        checkInDate: rawBookings[0].checkInDate,
        checkOutDate: rawBookings[0].checkOutDate
      });
    }

    // Ensure data is properly formatted with fallbacks
    const formattedBookings = rawBookings.map((b, idx) => {
      const bookingObj = b.toObject ? b.toObject() : b;
      console.log(`  Booking ${idx}:`, {
        hasGuest: !!b.guest,
        guestType: typeof b.guest,
        guestValue: b.guest,
        hasRoom: !!b.room,
        roomType: typeof b.room,
        roomValue: b.room
      });

      return {
        ...bookingObj,
        guest: b.guest ? (typeof b.guest === 'object' ? b.guest : { _id: b.guest }) : null,
        room: b.room ? (typeof b.room === 'object' ? b.room : { _id: b.room }) : null,
        guestName: b.guest && typeof b.guest === 'object' ? b.guest.name : 'Unknown',
        roomNumber: b.room && typeof b.room === 'object' ? b.room.roomNumber : 'TBA',
        roomType: b.room && typeof b.room === 'object' ? b.room.roomType : 'Unknown'
      };
    });

    res.status(200).json({
      status: 'success',
      data: formattedBookings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (err) {
    console.error('❌ Error fetching bookings:', err.message, err.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings',
      error: err.message,
      data: null
    });
  }
});

export default router;
