import express from 'express';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import AdminSettings from '../models/AdminSettings.js';
import Device from '../models/Device.js';
import VendorKyc from '../models/VendorKyc.js';
import VendorPerformance from '../models/VendorPerformance.js';
import * as vendorManagementController from '../controllers/vendorManagementController.js';
import * as vendorKycController from '../controllers/vendorKycController.js';
import * as vendorPerformanceController from '../controllers/vendorPerformanceController.js';
import * as settlementController from '../controllers/settlementController.js';
import * as payoutController from '../controllers/payoutController.js';
import * as roleController from '../controllers/roleController.js';
import { verifyAdmin as rbacVerifyAdmin, requirePermission } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// ============================================
// ADMIN AUTH & VERIFICATION MIDDLEWARE
// ============================================

// Middleware to verify admin access
const verifyAdmin = (req, res, next) => {
  // In production, verify JWT token
  const adminRole = req.headers['x-admin-role'];
  const userId = req.headers['x-user-id'];
  
  if (!adminRole || !userId) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }
  
  req.adminRole = adminRole;
  req.userId = userId;
  next();
};

// ============================================
// ORGANIZATIONS ROUTES
// ============================================

// Get all organizations
router.get('/organizations', verifyAdmin, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    
    const organizations = await Organization.find()
      .populate('owner', 'name email phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Organization.countDocuments();
    
    res.status(200).json({
      success: true,
      data: organizations,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single organization
router.get('/organizations/:id', verifyAdmin, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('staff', 'name email role');
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create organization
router.post('/organizations', verifyAdmin, async (req, res) => {
  try {
    const { name, type, owner, email, phone, address, website, description } = req.body;
    
    const organization = new Organization({
      name,
      type,
      owner,
      email,
      phone,
      address,
      website,
      description
    });
    
    await organization.save();
    console.log('✅ Organization created:', organization._id);
    
    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization
    });
  } catch (error) {
    console.error('❌ Error creating organization:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update organization
router.put('/organizations/:id', verifyAdmin, async (req, res) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify/Approve organization
router.patch('/organizations/:id/verify', verifyAdmin, async (req, res) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        status: 'active',
        verificationDate: new Date()
      },
      { new: true }
    );
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }
    
    console.log('✅ Organization verified:', organization._id);
    
    res.status(200).json({
      success: true,
      message: 'Organization verified successfully',
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Suspend organization
router.patch('/organizations/:id/suspend', verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      {
        status: 'suspended',
        settings: {
          ...req.body.settings,
          suspensionReason: reason
        }
      },
      { new: true }
    );
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }
    
    console.log('✅ Organization suspended:', organization._id);
    
    res.status(200).json({
      success: true,
      message: 'Organization suspended successfully',
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete organization
router.delete('/organizations/:id', verifyAdmin, async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }
    
    console.log('✅ Organization deleted:', organization._id);
    
    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// USERS MANAGEMENT ROUTES
// ============================================

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const userType = req.query.userType;
    const skip = (page - 1) * limit;
    
    const filter = userType ? { userType } : {};
    
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single user
router.get('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user
router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    // Don't allow password updates through this route
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Suspend user
router.patch('/users/:id/suspend', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true, suspensionReason: req.body.reason },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ User suspended:', user._id);
    
    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ User deleted:', user._id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// PAYMENTS MANAGEMENT ROUTES
// ============================================

// Get all payment transactions
router.get('/payments', verifyAdmin, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;
    
    const filter = status ? { status } : {};
    
    const transactions = await PaymentTransaction.find(filter)
      .populate('organization', 'name')
      .populate('vendor', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await PaymentTransaction.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get payment details
router.get('/payments/:id', verifyAdmin, async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findById(req.params.id)
      .populate('organization', 'name')
      .populate('vendor', 'name email')
      .populate('customer', 'name email');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Process payment
router.post('/payments/process', verifyAdmin, async (req, res) => {
  try {
    const {
      organization,
      vendor,
      amount,
      type,
      paymentMethod,
      referenceId,
      referenceType,
      description
    } = req.body;
    
    const platformCommission = (amount * 5) / 100; // 5% commission
    const paymentGatewayFee = (amount * 0.03) / 100 + 0.3; // 3% + $0.30
    const netAmount = amount - platformCommission - paymentGatewayFee;
    
    const transactionId = `TXN-${Date.now()}`;
    
    const transaction = new PaymentTransaction({
      transactionId,
      organization,
      vendor,
      amount,
      type,
      paymentMethod,
      referenceId,
      referenceType,
      description,
      platformCommission,
      paymentGatewayFee,
      netAmount,
      status: 'completed',
      completedDate: new Date()
    });
    
    await transaction.save();
    console.log('✅ Payment processed:', transactionId);
    
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Refund payment
router.post('/payments/:id/refund', verifyAdmin, async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findByIdAndUpdate(
      req.params.id,
      {
        status: 'refunded',
        refundedDate: new Date()
      },
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    console.log('✅ Payment refunded:', transaction._id);
    
    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// DEVICES MANAGEMENT ROUTES
// ============================================

// Get all devices
router.get('/devices', verifyAdmin, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const deviceType = req.query.deviceType;
    const skip = (page - 1) * limit;

    const filter = deviceType ? { deviceType } : {};

    const devices = await Device.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Device.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: devices,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new device
router.post('/devices', verifyAdmin, async (req, res) => {
  try {
    const { deviceId, deviceType, hotel, roomNumber, lastDetection, status } = req.body;

    // Validate required fields
    if (!deviceId || !deviceType) {
      return res.status(400).json({
        success: false,
        message: 'Device ID and Device Type are required'
      });
    }

    // Check if device ID already exists
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(409).json({
        success: false,
        message: `Device with ID "${deviceId}" already exists`
      });
    }

    const device = new Device({
      deviceId,
      deviceType,
      hotel,
      roomNumber,
      lastDetection,
      status: status !== undefined ? status : true
    });

    await device.save();
    console.log('✅ Device created:', device._id);

    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      data: device
    });
  } catch (error) {
    console.error('❌ Error creating device:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update device status
router.patch('/devices/:id/status', verifyAdmin, async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Device status updated',
      data: device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete device
router.delete('/devices/:id', verifyAdmin, async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    console.log('✅ Device deleted:', device._id);
    
    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// ANALYTICS & DASHBOARD STATS
// ============================================

// Get dashboard statistics
router.get('/analytics/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ userType: 'vendor' });
    const totalCustomers = await User.countDocuments({ userType: 'customer' });
    const totalOrganizations = await Organization.countDocuments();
    const totalTransactions = await PaymentTransaction.countDocuments();
    
    const totalRevenue = await PaymentTransaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const platformCommission = await PaymentTransaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformCommission' } } }
    ]);
    
    const activeOrganizations = await Organization.countDocuments({ status: 'active' });
    const pendingOrganizations = await Organization.countDocuments({ status: 'pending-verification' });
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          vendors: totalVendors,
          customers: totalCustomers
        },
        organizations: {
          total: totalOrganizations,
          active: activeOrganizations,
          pending: pendingOrganizations
        },
        payments: {
          totalTransactions,
          totalRevenue: totalRevenue[0]?.total || 0,
          platformCommission: platformCommission[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get revenue by organization type
router.get('/analytics/revenue-by-type', verifyAdmin, async (req, res) => {
  try {
    const revenueByType = await PaymentTransaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'organizations',
          localField: 'organization',
          foreignField: '_id',
          as: 'org'
        }
      },
      { $unwind: '$org' },
      {
        $group: {
          _id: '$org.type',
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: revenueByType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// VENDOR MANAGEMENT ROUTES
// ============================================

// Get all vendors with filtering
router.get('/vendors', verifyAdmin, vendorManagementController.getVendors);

// Get vendor by ID
router.get('/vendors/:vendorId', verifyAdmin, vendorManagementController.getVendorById);

// Create vendor
router.post('/vendors', verifyAdmin, vendorManagementController.createVendor);

// Update vendor
router.put('/vendors/:vendorId', verifyAdmin, vendorManagementController.updateVendor);

// Delete vendor
router.delete('/vendors/:vendorId', verifyAdmin, vendorManagementController.deleteVendor);

// Approve vendor
router.patch('/vendors/:vendorId/approve', verifyAdmin, vendorManagementController.approveVendor);

// Reject vendor
router.patch('/vendors/:vendorId/reject', verifyAdmin, vendorManagementController.rejectVendor);

// Suspend vendor
router.patch('/vendors/:vendorId/suspend', verifyAdmin, vendorManagementController.suspendVendor);

// Block vendor
router.patch('/vendors/:vendorId/block', verifyAdmin, vendorManagementController.blockVendor);

// Get vendor statistics
router.get('/vendors-stats', verifyAdmin, vendorManagementController.getVendorStats);

// ============================================
// VENDOR KYC ROUTES
// ============================================

// Get vendor KYC
router.get('/vendors/:vendorId/kyc', verifyAdmin, vendorKycController.getVendorKyc);

// Create or update KYC
router.put('/vendors/:vendorId/kyc', verifyAdmin, vendorKycController.createOrUpdateKyc);

// Approve KYC
router.patch('/vendors/:vendorId/kyc/approve', verifyAdmin, vendorKycController.approveKyc);

// Reject KYC
router.patch('/vendors/:vendorId/kyc/reject', verifyAdmin, vendorKycController.rejectKyc);

// Request KYC resubmission
router.patch('/vendors/:vendorId/kyc/resubmit', verifyAdmin, vendorKycController.requestResubmission);

// Update risk assessment
router.put('/vendors/:vendorId/kyc/risk', verifyAdmin, vendorKycController.updateRiskAssessment);

// Get pending KYC
router.get('/kyc/pending', verifyAdmin, vendorKycController.getPendingKyc);

// Get high-risk vendors
router.get('/kyc/high-risk', verifyAdmin, vendorKycController.getHighRiskVendors);

// ============================================
// VENDOR PERFORMANCE ROUTES
// ============================================

// Get vendor performance
router.get('/vendors/:vendorId/performance', verifyAdmin, vendorPerformanceController.getVendorPerformance);

// Update performance metrics
router.put('/vendors/:vendorId/performance', verifyAdmin, vendorPerformanceController.updatePerformanceMetrics);

// Record review
router.post('/vendors/:vendorId/performance/review', verifyAdmin, vendorPerformanceController.recordReview);

// Record booking
router.post('/vendors/:vendorId/performance/booking', verifyAdmin, vendorPerformanceController.recordBooking);

// Add monthly performance
router.post('/vendors/:vendorId/performance/monthly', verifyAdmin, vendorPerformanceController.addMonthlyPerformance);

// Get top performers
router.get('/performance/top-performers', verifyAdmin, vendorPerformanceController.getTopPerformers);

// Get vendors needing improvement
router.get('/performance/needs-improvement', verifyAdmin, vendorPerformanceController.getVendorsNeedingImprovement);

// ============================================
// SETTINGS ROUTES
// ============================================

// Get admin settings
router.get('/settings', verifyAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = new AdminSettings();
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update admin settings
router.put('/settings', verifyAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = new AdminSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();
    console.log('✅ Admin settings updated');

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// SETTLEMENT MANAGEMENT ROUTES
// ============================================

router.get('/settlements', verifyAdmin, settlementController.getSettlements);
router.get('/settlements/:settlementId', verifyAdmin, settlementController.getSettlementById);
router.post('/settlements', verifyAdmin, settlementController.createSettlement);
router.put('/settlements/:settlementId', verifyAdmin, settlementController.updateSettlement);
router.patch('/settlements/:settlementId/approve', verifyAdmin, settlementController.approveSettlement);
router.patch('/settlements/:settlementId/reject', verifyAdmin, settlementController.rejectSettlement);
router.delete('/settlements/:settlementId', verifyAdmin, settlementController.deleteSettlement);
router.get('/settlements/stats', verifyAdmin, settlementController.getSettlementStats);

// ============================================
// PAYOUT MANAGEMENT ROUTES
// ============================================

router.get('/payouts', verifyAdmin, payoutController.getPayouts);
router.get('/payouts/:payoutId', verifyAdmin, payoutController.getPayoutById);
router.post('/payouts', verifyAdmin, payoutController.createPayout);
router.put('/payouts/:payoutId', verifyAdmin, payoutController.updatePayout);
router.patch('/payouts/:payoutId/approve', verifyAdmin, payoutController.approvePayout);
router.patch('/payouts/:payoutId/process', verifyAdmin, payoutController.processPayout);
router.patch('/payouts/:payoutId/complete', verifyAdmin, payoutController.completePayout);
router.patch('/payouts/:payoutId/retry', verifyAdmin, payoutController.retryPayout);
router.patch('/payouts/:payoutId/cancel', verifyAdmin, payoutController.cancelPayout);

// Payout Schedule
router.get('/payout-schedules/:vendorId', verifyAdmin, payoutController.getPayoutSchedule);
router.put('/payout-schedules/:vendorId', verifyAdmin, payoutController.updatePayoutSchedule);

// ============================================
// ROLE & PERMISSION MANAGEMENT ROUTES
// ============================================

// Permissions
router.get('/permissions', verifyAdmin, roleController.getPermissions);
router.post('/permissions', verifyAdmin, roleController.createPermission);
router.put('/permissions/:permissionId', verifyAdmin, roleController.updatePermission);

// Roles
router.get('/roles', verifyAdmin, roleController.getRoles);
router.get('/roles/:roleId', verifyAdmin, roleController.getRoleById);
router.post('/roles', verifyAdmin, roleController.createRole);
router.put('/roles/:roleId', verifyAdmin, roleController.updateRole);
router.delete('/roles/:roleId', verifyAdmin, roleController.deleteRole);

// Role Permissions
router.post('/roles/:roleId/permissions/:permissionId', verifyAdmin, roleController.addPermissionToRole);
router.delete('/roles/:roleId/permissions/:permissionId', verifyAdmin, roleController.removePermissionFromRole);

// User Permissions
router.get('/users/:userId/permissions', verifyAdmin, roleController.getUserPermissions);
router.post('/check-permission', verifyAdmin, roleController.checkPermission);

export default router;
