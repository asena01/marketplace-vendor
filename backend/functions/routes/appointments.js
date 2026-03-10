import express from 'express';
import {
  getAllBookings,
  getBookingDetails,
  createServiceBooking,
  updateBookingStatus,
  cancelBooking,
  rateService
} from '../controllers/serviceBookingsController.js';

const router = express.Router();

// ============================================
// APPOINTMENTS ROUTES
// Maps /appointments/* to /service-bookings/* internally
// ============================================

// GET all appointments (with optional filters)
router.get('/', async (req, res, next) => {
  getAllBookings(req, res);
});

// GET single appointment by ID
router.get('/:appointmentId', async (req, res, next) => {
  req.params.bookingId = req.params.appointmentId;
  getBookingDetails(req, res);
});

// POST create new appointment
router.post('/', async (req, res, next) => {
  createServiceBooking(req, res);
});

// PUT update appointment (generic update)
router.put('/:appointmentId', async (req, res, next) => {
  req.params.bookingId = req.params.appointmentId;
  // For now, just update status as a generic update
  updateBookingStatus(req, res);
});

// PUT update appointment status
router.put('/:appointmentId/status', async (req, res, next) => {
  req.params.bookingId = req.params.appointmentId;
  updateBookingStatus(req, res);
});

// PUT cancel appointment
router.put('/:appointmentId/cancel', async (req, res, next) => {
  req.params.bookingId = req.params.appointmentId;
  cancelBooking(req, res);
});

// DELETE appointment
router.delete('/:appointmentId', async (req, res, next) => {
  try {
    return res.status(501).json({
      status: 'error',
      message: 'Delete appointment not yet implemented'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT assign staff to appointment
router.put('/:appointmentId/assign-staff', async (req, res, next) => {
  try {
    return res.status(501).json({
      status: 'error',
      message: 'Assign staff not yet implemented'
    });
  } catch (error) {
    console.error('Error assigning staff:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET available time slots for a service
router.get('/available-slots', async (req, res, next) => {
  try {
    const { providerId, serviceId, date } = req.query;
    
    if (!providerId || !serviceId || !date) {
      return res.status(400).json({
        status: 'error',
        message: 'providerId, serviceId, and date are required'
      });
    }
    
    // Return sample available slots
    const availableSlots = [
      { startTime: '09:00', endTime: '09:30', available: 1 },
      { startTime: '09:30', endTime: '10:00', available: 1 },
      { startTime: '10:00', endTime: '10:30', available: 2 },
      { startTime: '10:30', endTime: '11:00', available: 1 },
      { startTime: '14:00', endTime: '14:30', available: 2 },
      { startTime: '14:30', endTime: '15:00', available: 1 },
      { startTime: '15:00', endTime: '15:30', available: 1 },
    ];
    
    return res.status(200).json({
      status: 'success',
      data: availableSlots,
      date,
      providerId,
      serviceId
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      data: []
    });
  }
});

// PUT rate service (same as rate endpoint in service bookings)
router.put('/:appointmentId/rate', async (req, res, next) => {
  req.params.bookingId = req.params.appointmentId;
  rateService(req, res);
});

export default router;
