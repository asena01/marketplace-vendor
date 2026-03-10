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
  try {
    const { appointmentId } = req.params;
    const updateData = req.body;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ status: 'error', message: 'Database connection error' });
    }
    
    const ObjectId = req.app.locals.ObjectId;
    const ServiceBooking = db.collection('service-bookings');
    
    const result = await ServiceBooking.findByIdAndUpdate(
      new ObjectId(appointmentId),
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Appointment updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
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
    const { appointmentId } = req.params;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ status: 'error', message: 'Database connection error' });
    }
    
    const ObjectId = req.app.locals.ObjectId;
    const ServiceBooking = db.collection('service-bookings');
    
    const result = await ServiceBooking.findByIdAndDelete(new ObjectId(appointmentId));
    
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Appointment deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT assign staff to appointment
router.put('/:appointmentId/assign-staff', async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { staffId } = req.body;
    
    if (!staffId) {
      return res.status(400).json({ status: 'error', message: 'staffId is required' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ status: 'error', message: 'Database connection error' });
    }
    
    const ObjectId = req.app.locals.ObjectId;
    const ServiceBooking = db.collection('service-bookings');
    const ServiceStaff = db.collection('service-staff');
    
    // Verify staff exists
    const staff = await ServiceStaff.findById(new ObjectId(staffId));
    if (!staff) {
      return res.status(404).json({ status: 'error', message: 'Staff member not found' });
    }
    
    // Update booking with staff assignment
    const result = await ServiceBooking.findByIdAndUpdate(
      new ObjectId(appointmentId),
      {
        $set: {
          staffId,
          staffName: staff.name,
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Staff assigned successfully',
      data: result
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
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ status: 'error', message: 'Database connection error' });
    }
    
    const ObjectId = req.app.locals.ObjectId;
    const ServiceStaff = db.collection('service-staff');
    const ServiceBooking = db.collection('service-bookings');
    
    // Get staff members for this provider
    const staffMembers = await ServiceStaff.find({
      providerId
    }).toArray();
    
    if (!staffMembers.length) {
      return res.status(200).json({
        status: 'success',
        data: [],
        message: 'No staff members available'
      });
    }
    
    // Default service hours (can be customized)
    const startHour = 9;
    const endHour = 18;
    const slotDuration = 30; // minutes
    
    const availableSlots = [];
    
    // Generate time slots
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const endMinute = minute + slotDuration;
        const endHourSlot = hour + Math.floor(endMinute / 60);
        const endMinuteSlot = endMinute % 60;
        const endTimeString = `${String(endHourSlot).padStart(2, '0')}:${String(endMinuteSlot).padStart(2, '0')}`;
        
        // Check if this slot is available (not booked)
        const bookedCount = await ServiceBooking.countDocuments({
          serviceProvider: providerId,
          appointmentDate: date,
          startTime: timeString,
          status: { $ne: 'cancelled' }
        });
        
        if (bookedCount < staffMembers.length) {
          availableSlots.push({
            startTime: timeString,
            endTime: endTimeString,
            available: staffMembers.length - bookedCount
          });
        }
      }
    }
    
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
