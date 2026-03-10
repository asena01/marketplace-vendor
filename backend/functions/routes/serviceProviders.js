import express from 'express';
import {
  getVendorProfile,
  createOrUpdateVendorProfile,
  getVendorStats
} from '../controllers/vendorController.js';
import {
  getBusinessCustomers,
  getCustomerById,
  updateCustomer
} from '../controllers/customerController.js';
import {
  getNotificationsByUserId,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

// ============================================
// PROVIDER PROFILE ROUTES
// Maps /service-providers/* to vendor endpoints
// ============================================

// GET provider profile
router.get('/:providerId', async (req, res, next) => {
  req.params.userId = req.params.providerId;
  getVendorProfile(req, res);
});

// Update provider profile (PUT wrapper around POST)
router.put('/:providerId', async (req, res, next) => {
  req.params.userId = req.params.providerId;
  createOrUpdateVendorProfile(req, res);
});

// GET provider stats
router.get('/:providerId/stats', async (req, res, next) => {
  req.params.userId = req.params.providerId;
  getVendorStats(req, res);
});

// ============================================
// PROVIDER CLIENTS ROUTES
// Maps /service-providers/:providerId/clients to customer endpoints
// ============================================

// GET all clients (customers) for provider
router.get('/:providerId/clients', async (req, res, next) => {
  req.params.businessId = req.params.providerId;
  getBusinessCustomers(req, res);
});

// GET single client details
router.get('/clients/:clientId', async (req, res, next) => {
  req.params.customerId = req.params.clientId;
  getCustomerById(req, res);
});

// POST add note to client (wrapper around customer update)
router.post('/clients/:clientId/notes', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { note } = req.body;
    
    // Get existing customer
    const Customer = req.app.locals.db?.collection('customers');
    if (!Customer) {
      return res.status(500).json({ status: 'error', message: 'Database connection error' });
    }
    
    const ObjectId = req.app.locals.ObjectId;
    const customer = await Customer.findById(new ObjectId(clientId));
    
    if (!customer) {
      return res.status(404).json({ status: 'error', message: 'Client not found' });
    }
    
    // Add note to notes array
    if (!customer.notes) {
      customer.notes = [];
    }
    customer.notes.push({
      text: note,
      createdAt: new Date()
    });
    
    // Save customer
    await Customer.findByIdAndUpdate(
      new ObjectId(clientId),
      { notes: customer.notes },
      { new: true }
    );
    
    return res.status(200).json({
      status: 'success',
      message: 'Note added successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error adding client note:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET client appointment history (service bookings)
router.get('/clients/:clientId/appointments', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Redirect to service-bookings endpoint
    req.query.page = page;
    req.query.limit = limit;
    
    // This route will be handled by a wrapper that calls serviceBookings
    // For now, forward to the correct endpoint manually
    const ServiceBooking = req.app.locals.db?.collection('service-bookings');
    if (!ServiceBooking) {
      return res.status(500).json({ status: 'error', message: 'Database connection error' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await ServiceBooking
      .find({ customerId: clientId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await ServiceBooking.countDocuments({ customerId: clientId });
    
    return res.status(200).json({
      status: 'success',
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching client appointments:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================
// BADGE COUNTS ROUTES
// ============================================

// GET badge counts for dashboard sidenav
router.get('/:providerId/badge-counts', async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({ status: 'error', message: 'Database connection error' });
    }
    
    const ServiceBooking = db.collection('service-bookings');
    const Appointment = db.collection('appointments');
    const Review = db.collection('reviews');
    const Notification = db.collection('notifications');
    
    // Get pending appointments/bookings
    const pendingAppointments = await ServiceBooking.countDocuments({
      serviceProvider: providerId,
      status: 'pending'
    });
    
    // Get pending reviews
    const pendingReviews = await Review.countDocuments({
      vendorId: providerId,
      status: 'pending'
    });
    
    // Get unread notifications
    const unreadNotifications = await Notification.countDocuments({
      userId: providerId,
      read: false
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        pendingAppointments,
        pendingReviews,
        activeIncidents: 0, // Can be extended
        unreadNotifications
      }
    });
  } catch (error) {
    console.error('Error fetching badge counts:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      data: {
        pendingAppointments: 0,
        pendingReviews: 0,
        activeIncidents: 0,
        unreadNotifications: 0
      }
    });
  }
});

// ============================================
// NOTIFICATIONS ROUTES (under service-providers)
// ============================================

// GET notifications for provider
router.get('/:providerId/notifications', async (req, res, next) => {
  req.params.userId = req.params.providerId;
  const { page = 1, limit = 20 } = req.query;
  req.query.page = page;
  req.query.limit = limit;
  getNotificationsByUserId(req, res);
});

// GET unread notifications count
router.get('/:providerId/notifications/unread-count', async (req, res, next) => {
  req.params.userId = req.params.providerId;
  getUnreadCount(req, res);
});

// PUT mark all notifications as read
router.put('/:providerId/notifications/mark-all-read', async (req, res, next) => {
  req.params.userId = req.params.providerId;
  markAllNotificationsAsRead(req, res);
});

// PUT mark single notification as read (wrapper)
router.put('/notifications/:notificationId/read', async (req, res, next) => {
  req.params.id = req.params.notificationId;
  markNotificationAsRead(req, res);
});

export default router;
