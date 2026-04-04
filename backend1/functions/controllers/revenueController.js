import Transaction from '../models/Transaction.js';
import Booking from '../models/Booking.js';
import FoodOrder from '../models/FoodOrder.js';
import RoomServiceMenuItem from '../models/RoomServiceMenuItem.js';

// Get all transactions for a hotel
const getAllTransactions = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { type, status, guestName, page = 1, limit = 10 } = req.query;

    let filter = { hotel: hotelId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (guestName) filter.guestName = { $regex: guestName, $options: 'i' };

    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(filter)
      .populate('guest', 'name email')
      .populate('booking', 'bookingNumber')
      .limit(limit * 1)
      .skip(skip)
      .sort({ timestamp: -1 });

    const total = await Transaction.countDocuments(filter);

    return res.status(200).json({
      status: 'success',
      data: transactions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Get revenue statistics - AUTO-CALCULATED FROM REAL DATA SOURCES
const getRevenueStats = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // First, sync transactions from real sources
    await syncTransactionsFromSources(hotelId);

    // Calculate room revenue from confirmed/checked-in bookings
    const roomBookings = await Booking.find({
      hotel: hotelId,
      status: { $in: ['confirmed', 'checked-in', 'checked-out'] }
    });

    const roomRevenue = roomBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const roomTransactionCount = roomBookings.length;

    // Calculate food and drink revenue from food orders
    const foodOrders = await FoodOrder.find({
      hotel: hotelId,
      status: { $in: ['ready', 'delivered'] }
    });

    let foodRevenue = 0;
    let drinkRevenue = 0;
    let foodTransactionCount = 0;

    foodOrders.forEach(order => {
      if (order.category === 'drink') {
        drinkRevenue += order.totalPrice || 0;
      } else if (order.category === 'food' || order.category === 'mixed') {
        foodRevenue += order.totalPrice || 0;
      }
      foodTransactionCount += 1;
    });

    // Try to get service revenue (if service bookings exist)
    let serviceRevenue = 0;
    let serviceTransactionCount = 0;
    try {
      const ServiceBooking = require('../models/ServiceBooking.js').default;
      const serviceBookings = await ServiceBooking.find({
        hotel: hotelId,
        status: { $in: ['completed', 'paid'] }
      });

      serviceBookings.forEach(booking => {
        serviceRevenue += booking.totalPrice || booking.price || 0;
      });
      serviceTransactionCount = serviceBookings.length;
    } catch (e) {
      // Service booking model may not exist, that's okay
      console.log('ℹ️  Service booking model not available');
    }

    // Calculate totals
    const totalRevenue = roomRevenue + foodRevenue + drinkRevenue + serviceRevenue;
    const totalTransactions = roomTransactionCount + foodTransactionCount + serviceTransactionCount;

    // Calculate pending amount from transactions marked as pending
    const pendingTransactions = await Transaction.find({
      hotel: hotelId,
      status: 'pending'
    });
    const pendingAmount = pendingTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const stats = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      roomRevenue: Math.round(roomRevenue * 100) / 100,
      foodRevenue: Math.round(foodRevenue * 100) / 100,
      drinkRevenue: Math.round(drinkRevenue * 100) / 100,
      serviceRevenue: Math.round(serviceRevenue * 100) / 100,
      totalTransactions: totalTransactions,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      completedCount: totalTransactions
    };

    console.log('💰 Revenue Stats Calculated:', stats);

    return res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (err) {
    console.error('❌ Error calculating revenue stats:', err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Sync transactions from real data sources (helper function)
const syncTransactionsFromSources = async (hotelId) => {
  try {
    console.log('🔄 Syncing transactions from real sources...');

    // Get confirmed/checked-in bookings and create room transactions
    const roomBookings = await Booking.find({
      hotel: hotelId,
      status: { $in: ['confirmed', 'checked-in', 'checked-out'] }
    }).populate('guest', 'name email');

    for (const booking of roomBookings) {
      // Check if transaction already exists for this booking
      const existingTx = await Transaction.findOne({
        hotel: hotelId,
        booking: booking._id,
        type: 'room'
      });

      if (!existingTx && booking.totalPrice > 0) {
        await Transaction.create({
          hotel: hotelId,
          type: 'room',
          description: `Room booking - ${booking.numberOfNights || 1} nights`,
          amount: booking.totalPrice,
          guestName: booking.guest?.name || 'Unknown Guest',
          guest: booking.guest?._id,
          booking: booking._id,
          status: booking.status === 'checked-out' ? 'completed' : 'pending',
          paymentMethod: booking.paymentMethod || 'card',
          timestamp: booking.createdAt || new Date()
        });
      }
    }

    // Get delivered food orders and create food/drink transactions
    const foodOrders = await FoodOrder.find({
      hotel: hotelId,
      status: { $in: ['ready', 'delivered'] }
    }).populate('guest', 'name email');

    for (const order of foodOrders) {
      // Check if transaction already exists
      const existingTx = await Transaction.findOne({
        hotel: hotelId,
        description: { $regex: order.orderId || '' }
      });

      if (!existingTx && order.totalPrice > 0) {
        const type = order.category === 'drink' ? 'drink' : 'food';
        await Transaction.create({
          hotel: hotelId,
          type: type,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} order - Room ${order.roomNumber}`,
          amount: order.totalPrice,
          guestName: order.guestName || order.guest?.name || 'Unknown Guest',
          guest: order.guest?._id,
          status: order.status === 'delivered' ? 'completed' : 'pending',
          paymentMethod: 'card',
          timestamp: order.createdAt || new Date()
        });
      }
    }

    console.log('✅ Transactions synced from real sources');
  } catch (err) {
    console.error('❌ Error syncing transactions:', err.message);
  }
};

// Create a new transaction
const createTransaction = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { type, description, amount, guestName, guest, booking, status, paymentMethod } = req.body;

    if (!type || !description || !amount || !guestName) {
      return res.status(400).json({ status: 'failed', message: 'Missing required fields' });
    }

    const transaction = new Transaction({
      hotel: hotelId,
      type,
      description,
      amount,
      guestName,
      guest,
      booking,
      status: status || 'pending',
      paymentMethod: paymentMethod || 'card'
    });

    await transaction.save();
    await transaction.populate('guest', 'name email');
    await transaction.populate('booking', 'bookingNumber');

    return res.status(201).json({
      status: 'success',
      data: transaction,
      message: 'Transaction created successfully'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Update transaction status
const updateTransactionStatus = async (req, res) => {
  try {
    const { hotelId, id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ status: 'failed', message: 'Status is required' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, hotel: hotelId },
      { status },
      { new: true }
    ).populate('guest', 'name email').populate('booking', 'bookingNumber');

    if (!transaction) {
      return res.status(404).json({ status: 'failed', message: 'Transaction not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: transaction,
      message: 'Transaction updated successfully'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { hotelId, id } = req.params;
    const transaction = await Transaction.findOne({ _id: id, hotel: hotelId })
      .populate('guest', 'name email phone')
      .populate('booking');

    if (!transaction) {
      return res.status(404).json({ status: 'failed', message: 'Transaction not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: transaction
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { hotelId, id } = req.params;
    const transaction = await Transaction.findOneAndDelete({ _id: id, hotel: hotelId });

    if (!transaction) {
      return res.status(404).json({ status: 'failed', message: 'Transaction not found' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Transaction deleted successfully'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export {
  getAllTransactions,
  getRevenueStats,
  createTransaction,
  updateTransactionStatus,
  getTransactionById,
  deleteTransaction
};
