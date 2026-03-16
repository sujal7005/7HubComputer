import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getComponentOptions,
  getComponentsByCategory,
  saveCustomPC,
  getUserCustomPCs,
  deleteCustomPC,
  checkCompatibility,
  adminGetAllComponents,
  adminCreateComponent,
  adminUpdateComponent,
  adminDeleteComponent,
  adminBulkDeleteComponents,
  adminUpdateStock,
  adminGetCategories
} from '../controllers/customPCController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `component-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = express.Router();

// Public routes
router.get('/components', getComponentOptions);
router.get('/components/:category', getComponentsByCategory);
router.post('/check-compatibility', checkCompatibility);

// Protected routes (require authentication)
router.post('/save', saveCustomPC);
router.get('/user/:userId', getUserCustomPCs);
router.delete('/:id', deleteCustomPC);

// ============= ADMIN ROUTES =============

// Get all components with pagination and filters
router.get('/admin/components', adminGetAllComponents);

// Get categories with counts
router.get('/admin/categories', adminGetCategories);

// Create new component
router.post(
  '/admin/components',
  upload.array('images', 5), // Allow up to 5 images
  adminCreateComponent
);

// Update component
router.put(
  '/admin/components/:id',
  upload.array('images', 5),
  adminUpdateComponent
);

// Update stock only
router.patch(
  '/admin/components/:id/stock',
  adminUpdateStock
);

// Delete component
router.delete(
  '/admin/components/:id',
  adminDeleteComponent
);

// Bulk delete components
router.post(
  '/admin/components/bulk-delete',
  adminBulkDeleteComponents
);

export default router;