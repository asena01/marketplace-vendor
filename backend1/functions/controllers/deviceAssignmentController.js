import Device from '../models/Device.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

/**
 * Get all devices with their room assignments
 * GET /hotels/:hotelId/device-assignments
 */
export const getDeviceAssignments = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // Get all devices for this hotel
    const devices = await Device.find({ hotel: hotelId })
      .populate('room', 'roomNumber roomType floor')
      .sort({ roomNumber: 1, deviceType: 1 });

    // Get all rooms for this hotel
    const rooms = await Room.find({ hotel: hotelId })
      .select('roomNumber roomType floor capacity status')
      .sort({ roomNumber: 1 });

    // Build assignment map
    const assignmentMap = {};
    rooms.forEach(room => {
      assignmentMap[room._id] = {
        room,
        devices: devices.filter(d => d.room && d.room._id?.toString() === room._id?.toString())
      };
    });

    // Get unassigned devices
    const unassignedDevices = devices.filter(d => !d.room);

    return res.status(200).json({
      status: 'success',
      data: {
        assignmentMap,
        unassignedDevices,
        summary: {
          totalDevices: devices.length,
          assignedDevices: devices.filter(d => d.room).length,
          unassignedDevices: unassignedDevices.length,
          totalRooms: rooms.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching device assignments:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch device assignments'
    });
  }
};

/**
 * Assign a device to a room
 * POST /hotels/:hotelId/device-assignments/:deviceId/assign/:roomId
 */
export const assignDeviceToRoom = async (req, res) => {
  try {
    const { hotelId, deviceId, roomId } = req.params;

    // Verify device exists and belongs to this hotel
    const device = await Device.findById(deviceId);
    if (!device || device.hotel?.toString() !== hotelId) {
      return res.status(404).json({
        status: 'failed',
        message: 'Device not found or does not belong to this hotel'
      });
    }

    // Verify room exists and belongs to this hotel
    const room = await Room.findById(roomId);
    if (!room || room.hotel?.toString() !== hotelId) {
      return res.status(404).json({
        status: 'failed',
        message: 'Room not found or does not belong to this hotel'
      });
    }

    // Check if device is already assigned to another room
    if (device.room && device.room.toString() !== roomId) {
      console.warn(`Device ${deviceId} reassigned from room ${device.room} to room ${roomId}`);
    }

    // Update device assignment
    device.room = roomId;
    device.roomNumber = parseInt(room.roomNumber) || null;
    await device.save();

    return res.status(200).json({
      status: 'success',
      message: `Device assigned to Room ${room.roomNumber}`,
      data: {
        deviceId: device._id,
        deviceName: device.deviceId,
        roomId: room._id,
        roomNumber: room.roomNumber,
        assignment: {
          assignedAt: device.updatedAt,
          deviceType: device.deviceType,
          status: device.status
        }
      }
    });
  } catch (error) {
    console.error('Error assigning device:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to assign device'
    });
  }
};

/**
 * Unassign a device from a room
 * POST /hotels/:hotelId/device-assignments/:deviceId/unassign
 */
export const unassignDeviceFromRoom = async (req, res) => {
  try {
    const { hotelId, deviceId } = req.params;

    const device = await Device.findById(deviceId);
    if (!device || device.hotel?.toString() !== hotelId) {
      return res.status(404).json({
        status: 'failed',
        message: 'Device not found'
      });
    }

    const previousRoomId = device.room;
    device.room = null;
    device.roomNumber = null;
    await device.save();

    return res.status(200).json({
      status: 'success',
      message: 'Device unassigned from room',
      data: {
        deviceId: device._id,
        deviceName: device.deviceId,
        previousRoomId,
        unassignedAt: device.updatedAt
      }
    });
  } catch (error) {
    console.error('Error unassigning device:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to unassign device'
    });
  }
};

/**
 * Get devices for a specific room
 * GET /hotels/:hotelId/rooms/:roomId/devices
 */
export const getRoomDevices = async (req, res) => {
  try {
    const { hotelId, roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room || room.hotel?.toString() !== hotelId) {
      return res.status(404).json({
        status: 'failed',
        message: 'Room not found'
      });
    }

    const devices = await Device.find({ room: roomId, hotel: hotelId });

    return res.status(200).json({
      status: 'success',
      data: {
        room: {
          _id: room._id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          floor: room.floor,
          capacity: room.capacity
        },
        devices,
        summary: {
          totalDevices: devices.length,
          activeDevices: devices.filter(d => d.status).length,
          inactiveDevices: devices.filter(d => !d.status).length,
          deviceTypes: [...new Set(devices.map(d => d.deviceType))]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching room devices:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch room devices'
    });
  }
};

/**
 * Get statistics on device assignments
 * GET /hotels/:hotelId/device-assignments/statistics
 */
export const getAssignmentStatistics = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const devices = await Device.find({ hotel: hotelId });
    const rooms = await Room.find({ hotel: hotelId });

    const assigned = devices.filter(d => d.room);
    const unassigned = devices.filter(d => !d.room);

    // Group by device type
    const deviceTypeStats = {};
    devices.forEach(device => {
      if (!deviceTypeStats[device.deviceType]) {
        deviceTypeStats[device.deviceType] = {
          total: 0,
          assigned: 0,
          unassigned: 0
        };
      }
      deviceTypeStats[device.deviceType].total++;
      if (device.room) {
        deviceTypeStats[device.deviceType].assigned++;
      } else {
        deviceTypeStats[device.deviceType].unassigned++;
      }
    });

    // Get rooms without devices
    const roomsWithoutDevices = rooms.filter(room => {
      return !devices.some(d => d.room?.toString() === room._id?.toString());
    });

    return res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalDevices: devices.length,
          assignedDevices: assigned.length,
          unassignedDevices: unassigned.length,
          assignmentRate: devices.length > 0 ? Math.round((assigned.length / devices.length) * 100) : 0,
          totalRooms: rooms.length,
          roomsWithDevices: rooms.length - roomsWithoutDevices.length,
          roomsWithoutDevices: roomsWithoutDevices.length
        },
        deviceTypeStats,
        roomsWithoutDevices: roomsWithoutDevices.map(r => ({
          _id: r._id,
          roomNumber: r.roomNumber,
          roomType: r.roomType,
          floor: r.floor
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching assignment statistics:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assignment statistics'
    });
  }
};

export default {
  getDeviceAssignments,
  assignDeviceToRoom,
  unassignDeviceFromRoom,
  getRoomDevices,
  getAssignmentStatistics
};
