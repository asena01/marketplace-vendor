import express from 'express';
import {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getToursByDestination,
  getToursByDifficulty,
  getFeaturedTours,
  updateTourRating,
  updateTourParticipants,
  searchTours,
  getAgencyInfo,
  getBookings,
  getTourPackages
} from '../controllers/toursController.js';

const router = express.Router();

// Public endpoints - get tours
router.get('/featured', getFeaturedTours);
router.get('/search', searchTours);
router.get('/destination/:destination', getToursByDestination);
router.get('/difficulty/:difficulty', getToursByDifficulty);

// Agency and dashboard endpoints
router.get('/agency/:agencyId', getAgencyInfo);
router.get('/bookings', getBookings);
router.get('/packages', getTourPackages);

// Single tour endpoints
router.get('/:id', getTourById);

// Tour management endpoints
router.post('/', createTour);
router.put('/:id', updateTour);
router.delete('/:id', deleteTour);

// Update tour attributes
router.put('/:id/rating', updateTourRating);
router.put('/:id/participants', updateTourParticipants);

// General tours list (must be last to avoid conflicts)
router.get('/', getAllTours);

export default router;
