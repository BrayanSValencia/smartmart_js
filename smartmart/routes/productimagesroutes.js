import express from 'express';
import {
  createProductImage,
  getProductImages,
  getProductImage,
  updateProductImage,
  deleteProductImage
} from '../controllers/productimagecontroller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Product Image Routes
router.post('/createproductimage/', authenticateToken,requireRole("staff"), createProductImage);
router.get('/productimages/:product_id', getProductImages);
router.get('/productimage/:id', getProductImage);
router.put('/updateproductimage/:id', authenticateToken,requireRole("staff"), updateProductImage);
router.delete('/deleteproductimage/:id', authenticateToken,requireRole("staff"), deleteProductImage);

export default router;