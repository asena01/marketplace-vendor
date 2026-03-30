import express from 'express';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import {
  getDeviceStatus,
  getDeviceLogs,
  getDeviceShadowProperties
} from '../controllers/deviceController.js';

const router = express.Router();

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

        return {
          ...hotel.toObject(),
          id: hotel._id,
          reviews: hotel.reviewsCount || 0,
          icon: '🏨',
          price,
          // Explicitly include smart lock & contactless check-in feature
          contactlessCheckInEnabled: hotel.contactlessCheckInEnabled || false,
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
            icon: '🛏️'
          }))
        };
      })
    );

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

export default router;
