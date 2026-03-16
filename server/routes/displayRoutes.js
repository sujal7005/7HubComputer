import express from 'express';
import {
  getDisplays,
  getDisplayById,
  createDisplay,
  updateDisplay,
  deleteDisplay,
  getDisplaysByCategory,
  getFeaturedDisplays,
  getBrands,
  getCategories,
  bulkCreateDisplays
} from '../controllers/displayController.js';
// const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getDisplays);
router.get('/featured', getFeaturedDisplays);
router.get('/brands', getBrands);
router.get('/categories', getCategories);
router.get('/category/:category', getDisplaysByCategory);
router.get('/:id', getDisplayById);

// Admin routes
router.post('/', createDisplay);
router.post('/bulk', bulkCreateDisplays);
router.put('/:id', updateDisplay);
router.delete('/:id', deleteDisplay);

export default router;