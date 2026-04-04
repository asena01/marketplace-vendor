import Transaction from '../models/Transaction.js';
import Booking from '../models/Booking.js';

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

// Get revenue statistics
const getRevenueStats = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const transactions = await Transaction.find({ hotel: hotelId });

    const stats = {
      totalRevenue: 0,
      roomRevenue: 0,
      foodRevenue: 0,
      drinkRevenue: 0,
      serviceRevenue: 0,
      totalTransactions: transactions.length,
      pendingAmount: 0,
      completedCount: 0
    };

    transactions.forEach(tx => {
      if (tx.status === 'completed') {
        stats.totalRevenue += tx.amount;
        stats.completedCount += 1;
        
        if (tx.type === 'room') stats.roomRevenue += tx.amount;
        else if (tx.type === 'food') stats.foodRevenue += tx.amount;
        else if (tx.type === 'drink') stats.drinkRevenue += tx.amount;
        else if (tx.type === 'service') stats.serviceRevenue += tx.amount;
      } else if (tx.status === 'pending') {
        stats.pendingAmount += tx.amount;
      }
    });

    return res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
