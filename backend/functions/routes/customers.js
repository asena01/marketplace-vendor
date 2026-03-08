import express from 'express';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';

const router = express.Router();

// Get business customers
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { businessType, page = 1, limit = 20, status, sortBy = 'recent', search } = req.query;
    const skip = (page - 1) * limit;

    let filter = { businessId };
    if (businessType) {
      filter.businessType = businessType;
    }
    if (status) {
      filter.status = status;
    }

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    let sort = { lastPurchaseDate: -1 };
    if (sortBy === 'spent') {
      sort = { totalSpent: -1 };
    } else if (sortBy === 'purchases') {
      sort = { totalPurchases: -1 };
    } else if (sortBy === 'joined') {
      sort = { createdAt: -1 };
    }

    const customers = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(filter);

    // Calculate stats
    const stats = await Customer.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          ...(businessType && { businessType }),
        },
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' },
          averageSpent: { $avg: '$totalSpent' },
          vipCount: {
            $sum: { $cond: [{ $eq: ['$status', 'vip'] }, 1, 0] },
          },
          activeCount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', 'active'] },
                    { $eq: ['$status', 'vip'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      stats: stats.length > 0 ? stats[0] : {},
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get top customers
router.get('/business/:businessId/top', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { businessType, limit = 10 } = req.query;

    let filter = { businessId };
    if (businessType) {
      filter.businessType = businessType;
    }

    const topCustomers = await Customer.find(filter)
      .sort({ totalSpent: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: topCustomers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get single customer
router.get('/:customerId', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create customer (usually auto-created on first order)
router.post('/', async (req, res) => {
  try {
    const {
      businessId,
      businessType,
      userId,
      name,
      email,
      phone,
      address,
    } = req.body;

    if (!businessId || !businessType || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      businessId,
      email,
      businessType,
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer already exists',
      });
    }

    const customer = new Customer({
      businessId,
      businessType,
      userId,
      name,
      email,
      phone,
      address,
      firstPurchaseDate: new Date(),
    });

    await customer.save();

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update customer
router.put('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const updates = req.body;

    // Don't allow direct updates to purchase stats
    delete updates.totalPurchases;
    delete updates.totalSpent;
    delete updates.averageOrderValue;

    const customer = await Customer.findByIdAndUpdate(customerId, updates, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
      message: 'Customer updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update customer purchase stats (called after order)
router.put('/:customerId/purchases', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { orderAmount } = req.body;

    if (orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Order amount is required',
      });
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    customer.totalPurchases += 1;
    customer.totalSpent += orderAmount;
    customer.averageOrderValue = customer.totalSpent / customer.totalPurchases;
    customer.lastPurchaseDate = new Date();

    // Mark as VIP if total spent > $1000
    if (customer.totalSpent > 1000 && customer.status === 'active') {
      customer.status = 'vip';
    }

    await customer.save();

    res.status(200).json({
      success: true,
      data: customer,
      message: 'Customer stats updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete customer
router.delete('/:customerId', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
