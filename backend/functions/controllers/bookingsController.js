import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import VendorChat from "../models/VendorChat.js";
import mongoose from "mongoose";

/**
 * Create vendor chat for hotel booking
 */
const createHotelBookingChat = async (booking, hotelData) => {
  try {
    const vendorChat = new VendorChat({
      customerId: booking.guest,
      bookingId: booking._id.toString(),
      vendorId: booking.hotel.toString(),
      vendorName: hotelData?.name || 'Hotel',
      vendorType: 'hotel',
      vendorIcon: '🏨',
      subject: `Hotel Booking Confirmation`,
      status: 'open',
      messages: [
        {
          _id: new mongoose.Types.ObjectId(),
          sender: 'vendor',
          senderName: hotelData?.name || 'Hotel',
          message: `Welcome! Your booking from ${booking.checkInDate} to ${booking.checkOutDate} has been confirmed. Feel free to contact us for any questions!`,
          timestamp: new Date(),
          read: false
        }
      ]
    });
    await vendorChat.save();
    console.log('✅ Vendor chat created for hotel booking:', vendorChat._id);
    return vendorChat;
  } catch (error) {
    console.error('⚠️ Error creating vendor chat:', error.message);
    return null;
  }
};

// Get all bookings for a hotel
const getAllBookings = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;

    console.log('📋 ========== GET HOTEL BOOKINGS ==========');
    console.log('🏨 Hotel ID:', hotelId);
    console.log('🔍 Query params:', { status, paymentStatus, page, limit });

    let filter = { hotel: hotelId };
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    console.log('🔎 Filter object:', filter);

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filter)
      .populate("hotel", "name")
      .populate("guest", "name email phone")
      .populate("room", "roomNumber roomType")
      .limit(limit * 1)
      .skip(skip)
      .sort({ checkInDate: -1 });

    console.log('✅ Found', bookings.length, 'bookings matching filter');

    const total = await Booking.countDocuments(filter);

    return res.status(200).json({
      status: "success",
      data: bookings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("hotel", "name")
      .populate("guest", "name email phone")
      .populate("room", "roomNumber roomType pricePerNight");

    if (!booking) return res.status(404).json({ status: "failed", message: "Booking not found" });

    return res.status(200).json({ status: "success", data: booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { hotelId } = req.params;
    // Accept both 'guest' (vendor input) and 'customerId' (customer input) for backward compatibility
    const { guest, customerId, room, roomId, checkInDate, checkOutDate, numberOfGuests, roomRate, hotelId: bodyHotelId, ...rest } = req.body;

    const guestId = guest || customerId;
    const roomId_ = room || roomId;
    const hId = hotelId || bodyHotelId;

    console.log('📝 Creating booking with:', { guestId, roomId: roomId_, hotelId: hId });

    if (!guestId || !roomId_ || !checkInDate || !checkOutDate) {
      return res.status(400).json({ status: "failed", message: "Missing required fields: guest/customerId, room/roomId, checkInDate, checkOutDate" });
    }

    // Generate booking number
    const bookingNumber = "BK-" + Date.now().toString().slice(-10);

    const booking = new Booking({
      hotel: hId,
      bookingNumber,
      guest: guestId,
      room: roomId_,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      roomRate,
      ...rest
    });

    console.log('💾 Saving booking to database...');
    console.log('📝 Full booking object before save:', booking.toObject());
    await booking.save();
    console.log('✅ BOOKING SAVED SUCCESSFULLY!');
    console.log('📌 Booking ID:', booking._id);
    console.log('👤 Guest ID:', booking.guest);
    console.log('🏨 Hotel ID:', booking.hotel);
    console.log('🛏️  Room ID:', booking.room);

    await booking.populate("hotel", "name");
    await booking.populate("guest", "name email phone");
    await booking.populate("room", "roomNumber roomType");

    // Create vendor chat for booking
    const hotelData = booking.hotel;
    await createHotelBookingChat(booking, hotelData);

    // Update room status
    await Room.findByIdAndUpdate(room, { status: "reserved" });

    return res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      data: booking
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await Booking.findByIdAndUpdate(id, updates, { new: true })
      .populate("hotel", "name")
      .populate("guest", "name email phone")
      .populate("room", "roomNumber roomType");

    if (!booking) return res.status(404).json({ status: "failed", message: "Booking not found" });

    return res.status(200).json({
      status: "success",
      message: "Booking updated successfully",
      data: booking
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) return res.status(404).json({ status: "failed", message: "Booking not found" });

    // Update room status back to available
    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room, { status: "available" });
    }

    return res.status(200).json({
      status: "success",
      message: "Booking deleted successfully",
      data: booking
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "checked-in", "checked-out", "cancelled"].includes(status)) {
      return res.status(400).json({ status: "failed", message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) return res.status(404).json({ status: "failed", message: "Booking not found" });

    return res.status(200).json({
      status: "success",
      message: "Booking status updated",
      data: booking
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!["unpaid", "partial", "paid", "refunded"].includes(paymentStatus)) {
      return res.status(400).json({ status: "failed", message: "Invalid payment status" });
    }

    const booking = await Booking.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    if (!booking) return res.status(404).json({ status: "failed", message: "Booking not found" });

    return res.status(200).json({
      status: "success",
      message: "Payment status updated",
      data: booking
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

export {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  updatePaymentStatus
};
