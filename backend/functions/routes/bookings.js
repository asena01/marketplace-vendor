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
