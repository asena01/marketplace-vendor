import express from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantMenus,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createOrder,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/restaurantsController.js';

const router = express.Router();

// Public endpoints - get restaurants and their menus
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

// Restaurant menu endpoints
router.get('/:restaurantId/menus', getRestaurantMenus);
router.post('/:restaurantId/menus', addMenuItem);
router.put('/:restaurantId/menus/:menuItemId', updateMenuItem);
router.delete('/:restaurantId/menus/:menuItemId', deleteMenuItem);

// Order endpoints
router.post('/:restaurantId/orders', createOrder);
router.get('/:restaurantId/orders', getRestaurantOrders);
router.get('/:restaurantId/orders/:orderId', getOrderById);
router.put('/:restaurantId/orders/:orderId/status', updateOrderStatus);

// Restaurant management endpoints
router.post('/', createRestaurant);
router.put('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);

export default router;
