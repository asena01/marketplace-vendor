import express from 'express';
import {
  getDeviceAssignments,
  assignDeviceToRoom,
  unassignDeviceFromRoom,
  getRoomDevices,
  getAssignmentStatistics
} from '../controllers/deviceAssignmentController.js';

const router = express.Router();

/**
 * Get all device assignments for a hotel
 * GET /hotels/:hotelId/device-assignments
 */
router.get('/hotels/:hotelId/device-assignments', getDeviceAssignments);

/**
 * Get assignment statistics
 * GET /hotels/:hotelId/device-assignments/statistics
 */
router.get('/hotels/:hotelId/device-assignments/statistics', getAssignmentStatistics);

/**
 * Get devices assigned to a specific room
 * GET /hotels/:hotelId/rooms/:roomId/devices
 */
router.get('/hotels/:hotelId/rooms/:roomId/devices', getRoomDevices);

/**
 * Assign device to room
 * POST /hotels/:hotelId/device-assignments/:deviceId/assign/:roomId
 */
router.post('/hotels/:hotelId/device-assignments/:deviceId/assign/:roomId', assignDeviceToRoom);

/**
 * Unassign device from room
 * POST /hotels/:hotelId/device-assignments/:deviceId/unassign
 */
router.post('/hotels/:hotelId/device-assignments/:deviceId/unassign', unassignDeviceFromRoom);

export default router;
