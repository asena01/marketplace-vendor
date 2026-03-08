import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Create order
router.post('/', async (req, res) => {
  try {
    const { customer, items, totalAmount, paymentMethod, shippingAddress } = req.body;

    if (!customer || !items || !totalAmount || !paymentMethod || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const order = new Order({
      customer,
      items,
      totalAmount,
      paymentMethod,
      shippingAddress,
    });

    await order.save();
    await order.populate('customer', 'name email phone');
    await order.populate('items.product', 'name price');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get customer orders by userId (modern endpoint)
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { type } = req.query;
    const customerId = req.params.customerId;

    console.log(`\n🔍 DEBUG: Fetching orders for customerId: ${customerId}, type: ${type}`);

    // First, check if ANY orders exist for this customer
    const allOrders = await Order.find({
      $or: [
        { customer: customerId },
        { userId: customerId }
      ]
    });
    console.log(`📊 Total orders found for customer: ${allOrders.length}`);
    if (allOrders.length > 0) {
      console.log('Sample order:', allOrders[0]);
    }

    // Build filter - support both customer ID and userId
    let filter = {
      $or: [
        { customer: customerId },
        { userId: customerId }
      ]
    };

    // Filter by service type if provided
    if (type) {
      filter['items.serviceType'] = type;
      console.log(`Filtering by serviceType: ${type}`);
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 });

    // Note: Items are embedded in the order, no need to populate

    console.log(`✅ Returning ${orders.length} orders${type ? ` of type ${type}` : ''}\n`);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('❌ Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
