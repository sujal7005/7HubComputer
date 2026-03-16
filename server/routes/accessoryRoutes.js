// server/routes/accessoryRoutes.js
import express from 'express';
import {
  getAccessories,
  getAccessoryById,
  createAccessory,
  updateAccessory,
  deleteAccessory,
  getAccessoriesByCategory,
  getFeaturedAccessories,
  getBrands,
  getCategories,
  updateStock,
  bulkCreateAccessories
} from '../controllers/accessoryController.js';
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAccessories);
router.get('/featured', getFeaturedAccessories);
router.get('/brands', getBrands);
router.get('/categories', getCategories);
router.get('/category/:category', getAccessoriesByCategory);
router.get('/:id', getAccessoryById);

// Admin routes
router.post('/', createAccessory);
router.post('/bulk', bulkCreateAccessories);
router.put('/:id', updateAccessory);
router.put('/:id/stock', updateStock);
router.delete('/:id', deleteAccessory);

export default router;