import { Router } from 'express'
import { getProducts, createProducts, updateProduct, deleteProduct } from '../controllers/productController.js';
import multer from "multer";
import path from 'path';
import fs from 'fs';
const router = Router();

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
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg","image/jpg","image/png","image/gif"];
  const extname = allowedTypes.includes(file.mimetype);

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed!"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Set max file size to 10MB
  fileFilter,
}).array('image', 15); // Use .array to handle multiple image uploads
// const upload = multer({ dest: 'uploads/' });

router.get('/admin/products', getProducts);
router.put('/admin/products/:productType/:productId', upload, updateProduct, (req, res) => {
  console.log("PUT /admin/products/:productType/:id hit");
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  res.json({ success: true });
});
router.post('/admin/products/add', upload, (req, res, next) => {
  // Check if files exist
  if (!req.files || !req.files.length === 0) {
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


export default router;