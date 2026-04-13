import express from 'express';
import Room from '../models/Room.js';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  updatePaymentStatus,
  addRoomServiceOrder
} from '../controllers/bookingsController.js';
import { provisionSmartLockAccessForBooking } from '../controllers/smartLockController.js';

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

    console.log('🔐 ========== CONTACTLESS BOOKING ==========');
    console.log('🏨 Hotel ID from params:', hotelId);
    console.log('📊 Booking data:', booking);
    console.log('🆔 Identity verification:', identity);
    console.log('🔐 =========================================');

    // Create the booking first, then provision a real temporary smart key
    const Booking = (await import('../models/Booking.js')).default;

    const bookingData = {
      bookingNumber: 'BK-' + Date.now().toString().slice(-10),
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
      status: 'confirmed' // Auto-confirmed
    };

    console.log('💾 Creating booking with contactless-ready smart key flow...');
    console.log('📝 Final booking data to be saved:', JSON.stringify(bookingData, null, 2));

    const newBooking = new Booking(bookingData);
    await newBooking.save();
    await Room.findByIdAndUpdate(booking.roomId, { status: 'reserved' });

    let smartKeyData = null;
    try {
      const provisioned = await provisionSmartLockAccessForBooking({
        bookingId: newBooking._id,
        hotelId: hotelId || booking.hotelId,
        sendEmail: true,
        setupDevice: true
      });
      smartKeyData = provisioned.data;
    } catch (accessError) {
      console.warn('⚠️ Contactless booking created, but smart key provisioning failed:', accessError.message);
    }

    console.log('✅ CONTACTLESS BOOKING CREATED SUCCESSFULLY!');
    console.log('📌 Booking ID:', newBooking._id);
    console.log('👤 Guest ID:', newBooking.guest);
    console.log('🏨 Hotel ID:', newBooking.hotel);
    console.log('🛏️  Room ID:', newBooking.room);

    await newBooking.populate('hotel', 'name');
    await newBooking.populate('guest', 'name email phone');
    await newBooking.populate('room', 'roomType bedType amenities');

    return res.status(201).json({
      status: 'success',
      message: 'Booking created with auto-confirmation',
      data: {
        ...newBooking.toObject(),
        smartKeyAccess: smartKeyData
      }
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

// POST add room service order
router.post('/:bookingId/room-service-orders', addRoomServiceOrder);

export default router;
