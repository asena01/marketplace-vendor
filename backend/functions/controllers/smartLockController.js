import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { sendSmartLockAccessEmail } from '../services/emailService.js';
import tuyaSmartLockService from '../services/tuyaSmartLockService.js';

/**
 * Generate a unique access token for a booking
 */
export const generateAccessToken = (bookingId) => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Generate a random backup PIN (4-6 digits)
 */
export const generateBackupPin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Generate QR code for unlock URL
 */
export const generateQRCode = async (unlockUrl) => {
  try {
    const qrCode = await QRCode.toDataURL(unlockUrl);
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

/**
 * Create smart lock access for a booking
 * POST /smart-lock/create-access/:bookingId
 */
export const createSmartLockAccess = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { hotelId, sendEmail = true, setupDevice = false } = req.body;

    // Fetch booking with related data
    const booking = await Booking.findById(bookingId)
      .populate('room')
      .populate('guest')
      .populate('hotel');

    if (!booking) {
      return res.status(404).json({
        status: 'failed',
        message: 'Booking not found'
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        status: 'failed',
        message: 'Booking must be confirmed before creating smart lock access'
      });
    }

    // Generate access token and backup PIN
    const accessToken = generateAccessToken(bookingId);
    const backupPin = generateBackupPin();

    // Create unlock URL
    const unlockUrl = `${process.env.FRONTEND_URL || 'https://example.com'}/unlock?token=${accessToken}`;

    // Generate QR code
    const qrCode = await generateQRCode(unlockUrl);

    // Update booking with smart lock access
    booking.smartLockAccess = {
      accessToken,
      backupPin,
      qrCode,
      expiresAt: booking.checkOutDate, // Token valid until check-out
      enabled: true,
      unlockAttempts: []
    };

    await booking.save();

    // Setup device temporary access if enabled
    if (setupDevice && booking.room?.smartLockId) {
      try {
        const expiresIn = Math.floor((booking.checkOutDate - new Date()) / 1000); // seconds
        await tuyaSmartLockService.addTemporaryAccess(
          booking.room.smartLockId,
          booking.guest?.name || 'Guest',
          backupPin,
          expiresIn
        );
        console.log('✅ Temporary device access created:', booking.room.smartLockId);
      } catch (deviceError) {
        console.warn('⚠️ Failed to set up device access:', deviceError.message);
        // Don't fail the request if device setup fails
      }
    }

    // Send email if enabled
    let emailResult = null;
    if (sendEmail && booking.guest?.email) {
      try {
        emailResult = await sendSmartLockAccessEmail(booking.guest.email, {
          guestName: booking.guest.name || 'Guest',
          hotelName: booking.hotel?.name || 'Our Hotel',
          roomNumber: booking.room?.number || booking.room?.name || 'TBD',
          accessToken,
          backupPin,
          qrCodeUrl: qrCode,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          unlockPageUrl: unlockUrl
        });
        console.log('✅ Smart lock access email sent to:', booking.guest.email);
      } catch (emailError) {
        console.warn('⚠️ Failed to send email:', emailError.message);
        // Don't fail the request if email fails
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Smart lock access created',
      data: {
        accessToken,
        backupPin,
        qrCode,
        unlockUrl,
        expiresAt: booking.checkOutDate,
        bookingNumber: booking.bookingNumber,
        guestName: booking.guest?.name || 'Guest',
        guestEmail: booking.guest?.email,
        roomNumber: booking.room?.number || booking.room?.name,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        emailSent: !!emailResult?.success,
        deviceSetup: setupDevice ? true : false
      }
    });
  } catch (error) {
    console.error('Error creating smart lock access:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create smart lock access',
      error: error.message
    });
  }
};

/**
 * Unlock room using access token
 * POST /smart-lock/unlock
 */
export const unlockRoom = async (req, res) => {
  try {
    const { accessToken, method = 'token' } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        status: 'failed',
        message: 'Access token is required'
      });
    }

    // Find booking by access token
    const booking = await Booking.findOne({
      'smartLockAccess.accessToken': accessToken
    })
      .populate('room')
      .populate('hotel');

    if (!booking) {
      return res.status(404).json({
        status: 'failed',
        message: 'Invalid access token'
      });
    }

    // Check if smart lock access is enabled
    if (!booking.smartLockAccess?.enabled) {
      return res.status(400).json({
        status: 'failed',
        message: 'Smart lock access is not enabled for this booking'
      });
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(booking.smartLockAccess.expiresAt);

    if (now > expiresAt) {
      return res.status(400).json({
        status: 'failed',
        message: 'Access token has expired',
        expiryDate: expiresAt
      });
    }

    // Check if booking is checked-in or confirmed
    if (!['confirmed', 'checked-in'].includes(booking.status)) {
      return res.status(400).json({
        status: 'failed',
        message: `Cannot unlock room. Booking status is ${booking.status}`
      });
    }

    // Prepare unlock attempt log
    const unlockAttempt = {
      timestamp: new Date(),
      success: false,
      deviceId: booking.room?.smartLockId || null
    };

    // TODO: Call Tuya API to unlock the smart lock device
    // For now, we'll simulate successful unlock
    const unlockSuccess = await unlockSmartLockDevice(
      booking.hotel?._id,
      booking.room?.smartLockId
    );

    if (unlockSuccess) {
      unlockAttempt.success = true;
      booking.smartLockAccess.unlockAttempts.push(unlockAttempt);
      await booking.save();

      return res.status(200).json({
        status: 'success',
        message: 'Room unlocked successfully',
        data: {
          roomNumber: booking.room?.number || booking.room?.name,
          bookingNumber: booking.bookingNumber,
          unlockedAt: unlockAttempt.timestamp
        }
      });
    } else {
      // Log failed attempt
      unlockAttempt.error = 'Failed to communicate with smart lock device';
      unlockAttempt.success = false;
      booking.smartLockAccess.unlockAttempts.push(unlockAttempt);
      await booking.save();

      return res.status(500).json({
        status: 'error',
        message: 'Failed to unlock room. Device may be offline.',
        backupPin: booking.smartLockAccess.backupPin,
        backupPinInstructions: 'Use the backup PIN code to unlock the room manually'
      });
    }
  } catch (error) {
    console.error('Error unlocking room:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Unlock using backup PIN
 * POST /smart-lock/unlock-with-pin
 */
export const unlockWithPin = async (req, res) => {
  try {
    const { backupPin, bookingNumber } = req.body;

    if (!backupPin || !bookingNumber) {
      return res.status(400).json({
        status: 'failed',
        message: 'Backup PIN and booking number are required'
      });
    }

    const booking = await Booking.findOne({
      bookingNumber,
      'smartLockAccess.backupPin': backupPin
    })
      .populate('room')
      .populate('hotel');

    if (!booking) {
      return res.status(404).json({
        status: 'failed',
        message: 'Invalid PIN or booking number'
      });
    }

    // Check if access is still valid
    const now = new Date();
    const expiresAt = new Date(booking.smartLockAccess.expiresAt);

    if (now > expiresAt) {
      return res.status(400).json({
        status: 'failed',
        message: 'Access code has expired'
      });
    }

    // Unlock the device
    const unlockAttempt = {
      timestamp: new Date(),
      success: false,
      deviceId: booking.room?.smartLockId || null
    };

    const unlockSuccess = await unlockSmartLockDevice(
      booking.hotel?._id,
      booking.room?.smartLockId
    );

    if (unlockSuccess) {
      unlockAttempt.success = true;
      booking.smartLockAccess.unlockAttempts.push(unlockAttempt);
      await booking.save();

      return res.status(200).json({
        status: 'success',
        message: 'Room unlocked successfully',
        data: {
          roomNumber: booking.room?.number || booking.room?.name,
          unlockedAt: unlockAttempt.timestamp
        }
      });
    } else {
      unlockAttempt.error = 'Device offline';
      booking.smartLockAccess.unlockAttempts.push(unlockAttempt);
      await booking.save();

      return res.status(500).json({
        status: 'error',
        message: 'Failed to unlock room. Device may be offline.'
      });
    }
  } catch (error) {
    console.error('Error unlocking with PIN:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get unlock history for a booking
 * GET /smart-lock/history/:bookingId
 */
export const getUnlockHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .select('smartLockAccess bookingNumber')
      .populate('room', 'number name');

    if (!booking) {
      return res.status(404).json({
        status: 'failed',
        message: 'Booking not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        bookingNumber: booking.bookingNumber,
        unlockHistory: booking.smartLockAccess?.unlockAttempts || [],
        enabled: booking.smartLockAccess?.enabled || false
      }
    });
  } catch (error) {
    console.error('Error fetching unlock history:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch unlock history'
    });
  }
};

/**
 * Unlock actual Tuya smart lock device
 */
const unlockSmartLockDevice = async (hotelId, deviceId) => {
  try {
    if (!deviceId) {
      console.warn('No device ID provided for unlock');
      return false;
    }

    // Check if device is online first
    const isOnline = await tuyaSmartLockService.isDeviceOnline(deviceId);
    if (!isOnline) {
      console.warn('Device offline:', deviceId);
      return false;
    }

    // Send unlock command to device
    const result = await tuyaSmartLockService.unlockDevice(deviceId);

    if (result.success) {
      console.log('✅ Device unlocked successfully:', deviceId);
      return true;
    } else {
      console.error('❌ Failed to unlock device:', deviceId, result.error);
      return false;
    }
  } catch (error) {
    console.error('Error unlocking smart lock device:', error);
    return false;
  }
};

/**
 * Revoke smart lock access
 * POST /smart-lock/revoke/:bookingId
 */
export const revokeSmartLockAccess = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 'smartLockAccess.enabled': false },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        status: 'failed',
        message: 'Booking not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Smart lock access revoked',
      data: booking
    });
  } catch (error) {
    console.error('Error revoking smart lock access:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to revoke smart lock access'
    });
  }
};
