import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, phone, vendorType, businessName, businessDescription } = req.body;

    console.log('📝 Registration attempt:', { name, email, userType });
    console.log('📌 Request body:', req.body);

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone: phone || '',
      userType: userType || 'customer',
      ...(userType === 'vendor' && {
        vendorType,
        businessName,
        businessDescription,
      }),
    });

    await user.save();
    console.log('✅ User created successfully:', user._id);

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login attempt:', { email });

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);
    console.log('👤 User type:', user.userType);
    if (user.userType === 'vendor') {
      console.log('🏢 Vendor type:', user.vendorType);
    }

    const userResponse = user.toJSON();

    // Include deliveryPartnerId if user is a delivery vendor
    if (user.userType === 'vendor' && user.vendorType === 'delivery' && user.deliveryPartnerId) {
      userResponse.deliveryPartnerId = user.deliveryPartnerId;
      console.log('🚚 Delivery Partner ID:', user.deliveryPartnerId);
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create Demo Accounts (for testing)
router.post('/create-demo-accounts', async (req, res) => {
  try {
    console.log('🎭 Creating demo accounts...');

    const demoAccounts = [
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'admin123456',
        phone: '+1234567890',
        userType: 'admin'
      },
      {
        name: 'Demo Customer',
        email: 'customer@demo.com',
        password: 'demo123456',
        phone: '+1234567890',
        userType: 'customer'
      },
      {
        name: 'Demo Hotel',
        email: 'hotel@demo.com',
        password: 'demo123456',
        phone: '+1234567892',
        userType: 'vendor',
        vendorType: 'hotel',
        businessName: 'Demo Hotel',
        businessDescription: 'A demo hotel for testing'
      },
      {
        name: 'Demo Restaurant',
        email: 'restaurant@demo.com',
        password: 'demo123456',
        phone: '+1234567891',
        userType: 'vendor',
        vendorType: 'restaurant',
        businessName: 'Demo Restaurant',
        businessDescription: 'A demo restaurant for testing'
      },
      {
        name: 'Demo Retail Store',
        email: 'retail@demo.com',
        password: 'demo123456',
        phone: '+1234567893',
        userType: 'vendor',
        vendorType: 'retail',
        businessName: 'Demo Retail Store',
        businessDescription: 'A demo retail store for testing'
      },
      {
        name: 'Demo Service',
        email: 'service@demo.com',
        password: 'demo123456',
        phone: '+1234567894',
        userType: 'vendor',
        vendorType: 'service',
        businessName: 'Demo Service Business',
        businessDescription: 'A demo service business for testing'
      },
      {
        name: 'Demo Tours Agency',
        email: 'tours@demo.com',
        password: 'demo123456',
        phone: '+1234567895',
        userType: 'vendor',
        vendorType: 'tour-operator',
        businessName: 'Demo Tours Agency',
        businessDescription: 'A demo tour operator for testing'
      }
    ];

    const createdUsers = [];

    for (const account of demoAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: account.email });
      if (!existingUser) {
        const user = new User(account);
        await user.save();
        createdUsers.push(account.email);
        console.log('✅ Created demo account:', account.email);
      } else {
        console.log('⏭️ Demo account already exists:', account.email);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Demo accounts setup complete',
      createdAccounts: createdUsers,
    });
  } catch (error) {
    console.error('❌ Error creating demo accounts:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Validation
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID, current password, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Find user
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed for user:', userId);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Password change error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password'
    });
  }
});

export default router;
