import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './database.js';
import User from './models/User.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
// Hotel Dashboard Routes
import hotelRoutes from './routes/hotels.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import staffRoutes from './routes/staff.js';
import maintenanceRoutes from './routes/maintenance.js';
import invoiceRoutes from './routes/invoices.js';
import foodOrderRoutes from './routes/foodOrders.js';
import menuRoutes from './routes/menus.js';
import roomServiceRoutes from './routes/roomService.js';
import deviceRoutes from './routes/devices.js';
// New hotel feature routes
import revenueRoutes from './routes/revenue.js';
import staffLogsRoutes from './routes/staffLogs.js';
import preCheckinRoutes from './routes/preCheckin.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';
import deliveryRoutesOld from './routes/delivery.js';
import restaurantRoutes from './routes/restaurants.js';
import tourRoutes from './routes/tours.js';
import tourBookingsRoutes from './routes/tourBookings.js';
import servicesRoutes from './routes/services.js';
import serviceBookingsRoutes from './routes/serviceBookings.js';
import deliveryRoutesNew from './routes/deliveries.js';
import furnitureRoutes from './routes/furniture.js';
import hairRoutes from './routes/hair.js';
import petsRoutes from './routes/pets.js';
import gymEquipmentRoutes from './routes/gymEquipment.js';
import gymRoutes from './routes/gym.js';
import paymentRoutes from './routes/payments.js';
import vendorRoutes from './routes/vendors.js';
import vendorAnalyticsRoutes from './routes/vendorAnalytics.js';
import deliveryAdminRoutes from './routes/deliveryAdmin.js';
import uploadRoutes from './routes/uploads.js';
import deliveryProviderServiceRoutes from './routes/deliveryProviderServices.js';
import integratedDeliveryRoutes from './routes/integratedDeliveries.js';
import notificationRoutes from './routes/notifications.js';
import reviewRoutes from './routes/reviews.js';
import customerRoutes from './routes/customers.js';
import financeRoutes from './routes/finance.js';
import smartLockRoutes from './routes/smartLock.js';
import deviceAssignmentRoutes from './routes/deviceAssignments.js';
// Models
import Booking from './models/Booking.js';
// Service Provider Dashboard Routes
import serviceProviderRoutes from './routes/serviceProviders.js';
import appointmentRoutes from './routes/appointments.js';
import serviceStaffRoutes from './routes/serviceStaff.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// CORS configuration - More permissive for development/Builder.io
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // For development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ CORS: Allowing origin: ${origin}`);
      return callback(null, true);
    }

    // For production, restrict to known origins
    const allowedOrigins = [
      'http://localhost:4200',
      'http://localhost:3000',
      'http://127.0.0.1:4200',
      'https://www.smarttrackbookings.live',
      'https://smarttrackbookings.live'
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 600,
};

app.use(cors(corsOptions));
// Increase body size limit to 50MB to handle base64-encoded images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files as static assets
app.use('/uploads', express.static('uploads'));

// Log incoming requests with more detail
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.headers.origin) {
    console.log(`  Origin: ${req.headers.origin}`);
  }
  next();
});

// Connect to MongoDB
connectDB();

// Auto-create demo accounts on server startup
const createDemoAccounts = async () => {
  try {
    const demoAccounts = [
      // ========== ADMIN ACCOUNTS ==========
      {
        name: 'Super Admin',
        email: 'admin@demo.com',
        password: 'admin123456',
        phone: '+1234567899',
        userType: 'admin',
        adminRole: 'super-admin',
        adminPermissions: {
          manageOrganizations: true,
          manageUsers: true,
          manageDevices: true,
          processPayments: true,
          viewAnalytics: true,
          manageSettings: true,
          manageSuspensions: true,
          viewLogs: true
        }
      },
      {
        name: 'Finance Manager',
        email: 'finance@demo.com',
        password: 'demo123456',
        phone: '+1234567850',
        userType: 'admin',
        adminRole: 'finance-manager',
        adminPermissions: {
          processPayments: true,
          viewAnalytics: true,
          viewLogs: true
        }
      },
      {
        name: 'Compliance Officer',
        email: 'compliance@demo.com',
        password: 'demo123456',
        phone: '+1234567851',
        userType: 'admin',
        adminRole: 'compliance-officer',
        adminPermissions: {
          manageUsers: true,
          manageSuspensions: true,
          viewLogs: true
        }
      },
      {
        name: 'Support Manager',
        email: 'support@demo.com',
        password: 'demo123456',
        phone: '+1234567852',
        userType: 'admin',
        adminRole: 'support-manager',
        adminPermissions: {
          manageUsers: true,
          viewLogs: true
        }
      },
      {
        name: 'Vendor Manager',
        email: 'vendor-mgr@demo.com',
        password: 'demo123456',
        phone: '+1234567853',
        userType: 'admin',
        adminRole: 'vendor-manager',
        adminPermissions: {
          manageUsers: true,
          viewAnalytics: true
        }
      },

      // ========== CUSTOMER ACCOUNTS ==========
      {
        name: 'John Doe',
        email: 'customer@demo.com',
        password: 'demo123456',
        phone: '+1234567890',
        userType: 'customer',
        address: '123 Main St',
        city: 'New York',
        country: 'USA'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@demo.com',
        password: 'demo123456',
        phone: '+1234567897',
        userType: 'customer',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        country: 'USA'
      },
      {
        name: 'Mike Smith',
        email: 'mike@demo.com',
        password: 'demo123456',
        phone: '+1234567898',
        userType: 'customer',
        address: '789 Pine Rd',
        city: 'Chicago',
        country: 'USA'
      },

      // ========== VENDOR ACCOUNTS - DELIVERY & LOGISTICS ==========
      {
        name: 'Express Delivery Co',
        email: 'delivery@demo.com',
        password: 'demo123456',
        phone: '+1234567896',
        userType: 'vendor',
        vendorType: 'delivery',
        businessName: 'Express Delivery Co',
        businessDescription: 'Fast & reliable delivery service across the city'
      },

      // ========== VENDOR ACCOUNTS - ACCOMMODATION & FOOD ==========
      {
        name: 'Luxury Hotel Group',
        email: 'hotel@demo.com',
        password: 'demo123456',
        phone: '+1234567892',
        userType: 'vendor',
        vendorType: 'hotel',
        businessName: 'Luxury Hotel Group',
        businessDescription: '5-star hotel with premium amenities'
      },
      {
        name: 'Gourmet Restaurant',
        email: 'restaurant@demo.com',
        password: 'demo123456',
        phone: '+1234567891',
        userType: 'vendor',
        vendorType: 'restaurant',
        businessName: 'Gourmet Restaurant',
        businessDescription: 'Fine dining with international cuisine'
      },

      // ========== VENDOR ACCOUNTS - RETAIL & SHOPPING ==========
      {
        name: 'Fashion Retail',
        email: 'retail@demo.com',
        password: 'demo123456',
        phone: '+1234567893',
        userType: 'vendor',
        vendorType: 'retail',
        businessName: 'Fashion Retail',
        businessDescription: 'Clothing & fashion store with latest trends'
      },
      {
        name: 'Clothing Boutique',
        email: 'clothing@demo.com',
        password: 'demo123456',
        phone: '+1234567854',
        userType: 'vendor',
        vendorType: 'clothing-store',
        businessName: 'Clothing Boutique',
        businessDescription: 'Premium clothing for men & women'
      },
      {
        name: 'Jewelry Store',
        email: 'jewelry@demo.com',
        password: 'demo123456',
        phone: '+1234567855',
        userType: 'vendor',
        vendorType: 'jewelry',
        businessName: 'Jewelry Store',
        businessDescription: 'Fine jewelry & accessories'
      },
      {
        name: 'Supermarket Plus',
        email: 'supermarket@demo.com',
        password: 'demo123456',
        phone: '+1234567856',
        userType: 'vendor',
        vendorType: 'supermarket',
        businessName: 'Supermarket Plus',
        businessDescription: 'Grocery & general merchandise'
      },
      {
        name: 'Furniture Store',
        email: 'furniture@demo.com',
        password: 'demo123456',
        phone: '+1234567857',
        userType: 'vendor',
        vendorType: 'furniture',
        businessName: 'Furniture Store',
        businessDescription: 'Premium furniture & home decor'
      },

      // ========== VENDOR ACCOUNTS - SERVICES ==========
      {
        name: 'Hair & Beauty Salon',
        email: 'hair@demo.com',
        password: 'demo123456',
        phone: '+1234567858',
        userType: 'vendor',
        vendorType: 'hair-salon',
        businessName: 'Hair & Beauty Salon',
        businessDescription: 'Professional hair & beauty services'
      },
      {
        name: 'Pro Services',
        email: 'service@demo.com',
        password: 'demo123456',
        phone: '+1234567894',
        userType: 'vendor',
        vendorType: 'service',
        businessName: 'Pro Services',
        businessDescription: 'Professional services & consultations'
      },
      {
        name: 'Pet Care Center',
        email: 'pets@demo.com',
        password: 'demo123456',
        phone: '+1234567859',
        userType: 'vendor',
        vendorType: 'pet-store',
        businessName: 'Pet Care Center',
        businessDescription: 'Pet supplies & grooming services'
      },
      {
        name: 'Fitness Gym',
        email: 'gym@demo.com',
        password: 'demo123456',
        phone: '+1234567860',
        userType: 'vendor',
        vendorType: 'gym',
        businessName: 'Fitness Gym',
        businessDescription: 'Modern gym with personal training & yoga classes'
      },
      {
        name: 'Gym Equipment Wholesale',
        email: 'gym-equipment@demo.com',
        password: 'demo123456',
        phone: '+1234567864',
        userType: 'vendor',
        vendorType: 'gym-equipment',
        businessName: 'Gym Equipment Wholesale',
        businessDescription: 'Premium gym equipment & fitness products'
      },

      // ========== VENDOR ACCOUNTS - TOURS & TRAVEL ==========
      {
        name: 'Adventure Tours',
        email: 'tours@demo.com',
        password: 'demo123456',
        phone: '+1234567895',
        userType: 'vendor',
        vendorType: 'tour-operator',
        businessName: 'Adventure Tours',
        businessDescription: 'Exciting tours & travel packages'
      },
      {
        name: 'Car Rental Pro',
        email: 'car-rental@demo.com',
        password: 'demo123456',
        phone: '+1234567861',
        userType: 'vendor',
        vendorType: 'car-rental',
        businessName: 'Car Rental Pro',
        businessDescription: 'Vehicle rental with competitive rates'
      },
      {
        name: 'Event Center',
        email: 'events@demo.com',
        password: 'demo123456',
        phone: '+1234567862',
        userType: 'vendor',
        vendorType: 'event-center',
        businessName: 'Event Center',
        businessDescription: 'Perfect venue for all your events'
      },
      {
        name: 'Salon & Spa',
        email: 'spa@demo.com',
        password: 'demo123456',
        phone: '+1234567863',
        userType: 'vendor',
        vendorType: 'salon-spa',
        businessName: 'Salon & Spa',
        businessDescription: 'Wellness & beauty treatments'
      }
    ];

    const createdAccounts = [];

    for (const account of demoAccounts) {
      const existingUser = await User.findOne({ email: account.email });
      if (!existingUser) {
        const user = new User(account);
        await user.save();
        createdAccounts.push(account.email);
        console.log('✅ Auto-created demo account:', account.email);
      }
    }

    if (createdAccounts.length > 0) {
      console.log('\n🎭 Demo accounts created:', createdAccounts.join(', '));
    } else {
      console.log('✅ All demo accounts already exist in database');
    }
  } catch (error) {
    console.error('❌ Error auto-creating demo accounts:', error.message);
  }
};

// Run demo account creation after a short delay to ensure DB connection
setTimeout(() => {
  createDemoAccounts();
}, 1000);

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);

// Admin Dashboard Routes
app.use('/admin', adminRoutes);

// Delivery Service Routes
app.use('/api/delivery', deliveryRoutesOld);

// Hotel Dashboard Routes
app.use('/hotels', hotelRoutes);
app.use('/hotels/:hotelId/rooms', roomRoutes);
app.use('/hotels/:hotelId/bookings', bookingRoutes);

// Customer Hotel Bookings Routes (for customers to view their bookings)
app.get('/hotel-bookings/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log('🏨 ========== FETCH CUSTOMER BOOKINGS ==========');
    console.log('👤 Customer ID:', customerId);

    const bookings = await Booking.find({ guest: customerId })
      .populate('hotel', 'name location address')
      .populate('room', 'roomType bedType amenities')
      .sort({ createdAt: -1 });

    console.log('✅ Found', bookings.length, 'bookings for customer:', customerId);
    console.log('🏨 ============================================');

    return res.status(200).json({
      success: true,
      data: bookings,
      message: 'Hotel bookings retrieved successfully'
    });
  } catch (err) {
    console.error('❌ Error fetching hotel bookings:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching hotel bookings',
      error: err.message
    });
  }
});

// Room Service Order - Add order to booking
app.post('/hotel-bookings/:bookingId/room-service-orders', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { items, totalPrice, notes } = req.body;

    console.log('🍽️ ========== ADD ROOM SERVICE ORDER ==========');
    console.log('📌 Booking ID:', bookingId);
    console.log('📦 Order items:', items);
    console.log('💰 Total price:', totalPrice);
    console.log('📝 Notes:', notes);

    if (!bookingId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, items'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const roomServiceOrder = {
      _id: new mongoose.Types.ObjectId(),
      items,
      totalPrice,
      notes,
      status: 'pending',
      orderedAt: new Date()
    };

    if (!booking.roomServiceOrders) {
      booking.roomServiceOrders = [];
    }
    booking.roomServiceOrders.push(roomServiceOrder);
    await booking.save();

    console.log('✅ Room service order added successfully!');
    console.log('🔔 Order ID:', roomServiceOrder._id);

    return res.status(201).json({
      success: true,
      message: 'Room service order placed successfully',
      data: {
        orderId: roomServiceOrder._id,
        booking
      }
    });
  } catch (err) {
    console.error('❌ Error adding room service order:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to place room service order',
      error: err.message
    });
  }
});
app.use('/hotels/:hotelId/staff', staffRoutes);
app.use('/hotels/:hotelId/maintenance', maintenanceRoutes);
app.use('/hotels/:hotelId/invoices', invoiceRoutes);
app.use('/hotels/:hotelId/food-orders', foodOrderRoutes);
app.use('/hotels/:hotelId/menus', menuRoutes);
app.use('/hotels/:hotelId/room-service', roomServiceRoutes);
// New hotel feature routes
app.use('/hotels/:hotelId/revenue', revenueRoutes);
app.use('/hotels/:hotelId/staff-logs', staffLogsRoutes);
app.use('/hotels/:hotelId/pre-checkin', preCheckinRoutes);
app.use('/hotels/:hotelId/analytics', analyticsRoutes);

// Restaurant Delivery Routes
app.use('/restaurants', restaurantRoutes);

// Tours Routes
app.use('/tours', tourRoutes);
app.use('/tour-bookings', tourBookingsRoutes);

// Services Routes
app.use('/services', servicesRoutes);
app.use('/service-bookings', serviceBookingsRoutes);

// Fast Delivery Routes (new system)
app.use('/deliveries', deliveryRoutesNew);

// Furniture, Hair, Pets, Gym Equipment Routes
app.use('/furniture', furnitureRoutes);
app.use('/hair', hairRoutes);
app.use('/pets', petsRoutes);
app.use('/gym-equipment', gymEquipmentRoutes);
app.use('/gym', gymRoutes);

// Payment Routes
app.use('/payments', paymentRoutes);

// Vendor Routes
app.use('/vendors', vendorRoutes);
app.use('/api/vendor-analytics', vendorAnalyticsRoutes);

// Finance Routes
app.use('/finance', financeRoutes);

// Delivery Management Routes
app.use('/api/delivery-admin', deliveryAdminRoutes);

// Delivery Provider Services Routes
app.use('/delivery-providers', deliveryProviderServiceRoutes);

// Integrated Deliveries Routes (for restaurants using delivery providers)
app.use('/integrated-deliveries', integratedDeliveryRoutes);

// Notification, Review, and Customer Routes
app.use('/notifications', notificationRoutes);
app.use('/reviews', reviewRoutes);
app.use('/customers', customerRoutes);

app.use('/devices', deviceRoutes);

// Smart Lock Routes (Booking Access & Room Unlocking)
app.use('/smart-lock', smartLockRoutes);

// Device Assignment Routes (Room-Device Connections)
app.use('/', deviceAssignmentRoutes);

// Service Provider Dashboard Routes (Frontend API Aliases)
app.use('/service-providers', serviceProviderRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/service-staff', serviceStaffRoutes);

// Upload Routes (replaces Firebase Storage) - API endpoint for file operations
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MarketHub Backend running on http://localhost:${PORT}`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/health`);
  console.log('✅ All routes loaded successfully');
});

export default app;
