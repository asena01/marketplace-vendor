import crypto from 'crypto';
import Device from '../models/Device.js';
import Room from '../models/Room.js';
import Staff from '../models/Staff.js';
import SmartAccessGrant from '../models/SmartAccessGrant.js';
import tuyaSmartLockService from '../services/tuyaSmartLockService.js';

const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateAccessToken = () => crypto.randomBytes(16).toString('hex');

const resolveRoomLockDevice = async (hotelId, roomId) => {
  const room = await Room.findOne({ _id: roomId, hotel: hotelId })
    .populate('smartLockDevice', 'deviceId tuyaDeviceId status');

  if (!room) {
    throw new Error('Room not found');
  }

  if (!room.smartLockDevice) {
    throw new Error('This room does not have a smart lock assigned');
  }

  return room;
};

export const getSmartAccessGrants = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { subjectType, status = 'active' } = req.query;
    const filter = { hotel: hotelId };

    if (subjectType) filter.subjectType = subjectType;
    if (status) filter.status = status;

    const grants = await SmartAccessGrant.find(filter)
      .populate('room', 'roomNumber accessMode contactlessReady monitoringEnabled')
      .populate('device', 'deviceId deviceType tuyaDeviceId status')
      .populate('subjectStaff', 'name email position department status')
      .populate('subjectUser', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: grants
    });
  } catch (error) {
    console.error('Error fetching smart access grants:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch smart access grants'
    });
  }
};

export const assignStaffSmartAccess = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { staffId, roomId, validFrom, validUntil, notes } = req.body;

    if (!staffId || !roomId || !validFrom || !validUntil) {
      return res.status(400).json({
        status: 'failed',
        message: 'staffId, roomId, validFrom, and validUntil are required'
      });
    }

    const [staff, room] = await Promise.all([
      Staff.findOne({ _id: staffId, hotel: hotelId }),
      resolveRoomLockDevice(hotelId, roomId)
    ]);

    if (!staff) {
      return res.status(404).json({
        status: 'failed',
        message: 'Staff member not found'
      });
    }

    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(untilDate.getTime()) || fromDate >= untilDate) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid access window'
      });
    }

    const device = room.smartLockDevice;
    const accessCode = generateAccessCode();
    const tuyaDeviceId = device.tuyaDeviceId || device.deviceId;
    const expiresIn = Math.max(300, Math.floor((untilDate.getTime() - Date.now()) / 1000));

    let deviceProvisioned = false;
    if (tuyaDeviceId) {
      const provisionResult = await tuyaSmartLockService.addTemporaryAccess(
        tuyaDeviceId,
        staff.name,
        accessCode,
        expiresIn
      );
      deviceProvisioned = provisionResult.success === true;
    }

    const grant = await SmartAccessGrant.create({
      hotel: hotelId,
      room: room._id,
      device: device._id,
      subjectType: 'staff',
      subjectStaff: staff._id,
      grantType: 'staff-shift',
      accessCode,
      accessToken: generateAccessToken(),
      validFrom: fromDate,
      validUntil: untilDate,
      metadata: {
        notes: notes || '',
        deviceProvisioned
      }
    });

    await grant.populate('room', 'roomNumber accessMode contactlessReady monitoringEnabled');
    await grant.populate('subjectStaff', 'name email position department');
    await grant.populate('device', 'deviceId deviceType tuyaDeviceId status');

    return res.status(201).json({
      status: 'success',
      message: 'Staff smart key assigned successfully',
      data: grant
    });
  } catch (error) {
    console.error('Error assigning staff smart access:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to assign staff smart access'
    });
  }
};

export const revokeSmartAccessGrant = async (req, res) => {
  try {
    const { hotelId, grantId } = req.params;

    const grant = await SmartAccessGrant.findOne({ _id: grantId, hotel: hotelId })
      .populate('device', 'deviceId tuyaDeviceId')
      .populate('room', 'roomNumber');

    if (!grant) {
      return res.status(404).json({
        status: 'failed',
        message: 'Smart access grant not found'
      });
    }

    if (grant.status !== 'active') {
      return res.status(200).json({
        status: 'success',
        message: 'Smart access grant already inactive',
        data: grant
      });
    }

    const tuyaDeviceId = grant.device?.tuyaDeviceId || grant.device?.deviceId;
    if (tuyaDeviceId && grant.accessCode) {
      await tuyaSmartLockService.removeTemporaryAccess(tuyaDeviceId, grant.accessCode);
    }

    grant.status = 'revoked';
    grant.revokedAt = new Date();
    await grant.save();

    return res.status(200).json({
      status: 'success',
      message: 'Smart access grant revoked successfully',
      data: grant
    });
  } catch (error) {
    console.error('Error revoking smart access grant:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to revoke smart access grant'
    });
  }
};
