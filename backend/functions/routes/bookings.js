import express from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  updatePaymentStatus
} from '../controllers/bookingsController.js';

const router = express.Router({ mergeParams: true });

// GET all bookings
router.get('/', getAllBookings);

// GET booking by ID
router.get('/:id', getBookingById);

// POST create booking with auto-confirmation (contactless check-in)
router.post('/auto-confirm', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { booking, identity } = req.body;

    console.log('🔐 Creating booking with auto-confirmation...');
    console.log('📊 Booking data:', booking);
    console.log('🆔 Identity verification:', identity);

    // Create the booking with confirmed status and smart lock access
    const Booking = (await import('../models/Booking.js')).default;

    const bookingData = {
      hotel: hotelId || booking.hotelId,
      guest: booking.customerId,
      room: booking.roomId,
      checkInDate: booking.checkIn,
      checkOutDate: booking.checkOut,
      numberOfGuests: booking.guests,
      numberOfRooms: booking.roomCount,
      totalPrice: booking.totalPrice,
      specialRequests: booking.specialRequests,
      paymentMethod: 'contactless',
      paymentStatus: 'paid', // Auto-confirm means immediate payment
      status: 'confirmed', // Auto-confirmed
      smartLockAccess: {
        accessToken: 'CONTACTLESS_' + Date.now(),
        backupPin: Math.random().toString().slice(2, 8),
        qrCode: 'QR_' + Date.now(),
        enabled: true,
        expiresAt: new Date(booking.checkOut)
      }
    };

    console.log('💾 Creating booking with smart lock access...');
    const newBooking = new Booking(bookingData);
    await newBooking.save();
    console.log('✅ Contactless booking created:', newBooking._id);

    await newBooking.populate('hotel', 'name');
    await newBooking.populate('guest', 'name email phone');
    await newBooking.populate('room', 'roomType bedType amenities');

    return res.status(201).json({
      status: 'success',
      message: 'Booking created with auto-confirmation',
      data: newBooking
    });
  } catch (err) {
    console.error('Error creating booking with auto-confirmation:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create booking with auto-confirmation',
      error: err.message
    });
  }
});

// POST create booking
router.post('/', createBooking);

// PUT update booking
router.put('/:id', updateBooking);

// PUT update booking status
router.put('/:id/status', updateBookingStatus);

// PUT update payment status
router.put('/:id/payment-status', updatePaymentStatus);

// DELETE booking
router.delete('/:id', deleteBooking);

export default router;
