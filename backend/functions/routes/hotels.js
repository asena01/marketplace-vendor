import express from 'express';
import Hotel from '../models/Hotel.js';
import {
  getDeviceStatus,
  getDeviceLogs,
  getDeviceShadowProperties
} from '../controllers/deviceController.js';

const router = express.Router();

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

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotelId = req.params.id;
    console.log('🏨 Fetching hotel with ID:', hotelId);
    console.log('📌 Request URL:', req.originalUrl);

    const hotel = await Hotel.findById(hotelId).populate('owner', 'name email phone');

    console.log('🔍 Hotel query result:', hotel);

    if (!hotel) {
      console.log('⚠️ Hotel not found for ID:', hotelId);
      return res.status(404).json({
        status: 'failed',
        message: 'Hotel not found',
        searchedId: hotelId
      });
    }

    console.log('✅ Hotel found:', hotel._id, hotel.name);
    res.status(200).json({ status: 'success', data: hotel });
  } catch (err) {
    console.error('❌ Error fetching hotel:', err.message);
    console.error('Stack:', err.stack);
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
