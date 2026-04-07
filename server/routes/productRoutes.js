import { Router } from 'express'
import { getProducts, createProducts, updateProduct, deleteProduct, downloadQuotation } from '../controllers/productController.js';
import multer from "multer";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const router = Router();

// Get the directory name properly for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // The directory to store the files
  },
  filename: (req, file, cb) => {
    // Clean the original filename to remove special characters
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueName = `${Date.now()}-${cleanName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg","image/jpg","image/png","image/gif", "image/webp"];
  const extname = allowedTypes.includes(file.mimetype);

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed!`), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Set max file size to 10MB
  fileFilter,
}).fields([
  { name: 'image', maxCount: 10 }, // Main product images
  { name: 'additionalImages', maxCount: 20 } // Additional gallery images
]);

// Middleware to handle multer upload and errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error("Multer error:", err);
      return res.status(400).json({ 
        error: `Upload error: ${err.message}`,
        code: err.code 
      });
    } else if (err) {
      // An unknown error occurred
      console.error("Unknown upload error:", err);
      return res.status(500).json({ error: err.message });
    }
    
    // Log uploaded files for debugging
    if (req.files) {
      console.log("Uploaded files:", {
        mainImages: req.files.image?.length || 0,
        additionalImages: req.files.additionalImages?.length || 0
      });
    }
    
    next();
  });
};

router.get('/admin/products', getProducts);
router.put('/admin/products/:productType/:productId', uploadMiddleware, updateProduct, (req, res) => {
  console.log("PUT /admin/products/:productType/:id hit");
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  res.json({ success: true });
});
router.post('/admin/products/add', uploadMiddleware, (req, res, next) => {
  // Check if files exist
  if (!req.files || (!req.files.image || req.files.image.length === 0) && (!req.files.additionalImages || req.files.additionalImages.length === 0)) {
    return res.status(400).json({ error: "No files uploaded or invalid file fields" });
  }

  // console.log("Headers:", req.headers);  // Check the request headers
  // console.log("Body:", req.body);    // Check the request body

  // req.files.forEach((file) => {
  //   console.log(`Uploaded File: ${file.originalname}, Path: ${file.path}, Size: ${file.size}`);
  // });
  next();
}, createProducts);

// **Delete Product Route**
router.delete('/admin/products/:productType/:productId', deleteProduct, (req, res) => {
  console.log("DELETE /admin/products/:productId hit");
  console.log("Params:", req.params);
  res.json({ success: true });
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err.message);
    res.status(400).json({ error: `Multer error: ${err.message}` });
  } else {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/download-quotation/:id', downloadQuotation);


export default router;