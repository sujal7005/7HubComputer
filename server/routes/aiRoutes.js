import express from "express";
import { 
  aiAssistant, 
  getOllamaModels,
  setOllamaModel,
  searchProducts,
  getAllProductsEndpoint,
  getProductById,
  getOrderStatus,
  submitSupportTicket,
  getUserDashboardInfo,
  getUserCustomPCs,
  getUserTransactions,
  getActiveDiscounts,
  validateDiscount
} from "../controllers/aiController.js";

const router = express.Router();

// AI Assistant endpoints
router.post("/ask", aiAssistant);
router.get("/models", getOllamaModels);
router.post("/model", setOllamaModel);

// Product endpoints
router.get("/search", searchProducts);
router.get("/products", getAllProductsEndpoint);
router.get("/product/:id", getProductById);

// User-specific endpoints (require authentication)
router.get("/user/dashboard", getUserDashboardInfo);
router.get("/user/custom-pcs", getUserCustomPCs);
router.get("/user/transactions", getUserTransactions);

// Order endpoints (require authentication)
router.get("/order/:orderId", getOrderStatus);

// Discount endpoints
router.get("/discounts", getActiveDiscounts);
router.post("/discounts/validate", validateDiscount);

// Support endpoints
router.post("/support-ticket", submitSupportTicket);

export default router;