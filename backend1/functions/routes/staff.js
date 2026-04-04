import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} from '../controllers/staffController.js';

const router = express.Router({ mergeParams: true });

// GET all staff
router.get('/', getAllStaff);

// GET staff by ID
router.get('/:id', getStaffById);

// POST create staff
router.post('/', createStaff);

// PUT update staff
router.put('/:id', updateStaff);

// DELETE staff
router.delete('/:id', deleteStaff);

export default router;
