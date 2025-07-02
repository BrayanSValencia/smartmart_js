import express from 'express';
import {
  createProduct,
  getProducts,
  getProductsCategories,
  getProductsByCategory,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  deactivateProduct,
  activateProduct,
} from '../controllers/productcontroller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();


router.post('/createproduct/', authenticateToken,requireRole("staff"), createProduct);
router.get('/listproducts/', getProducts);
router.get('/productscategories/', getProductsCategories);
router.get('/productscategory/:slug/', getProductsByCategory);
router.get('/retrieveproduct/:slug/', getProductBySlug);
router.put('/updateproduct/:slug/:id/', authenticateToken,requireRole("staff"), updateProduct); 
router.patch('/updateproduct/:slug/:id/', authenticateToken,requireRole("staff"), updateProduct); 

router.delete('/deleteproduct/:slug/:id/', authenticateToken,requireRole("staff"), deleteProduct);
router.patch('/deactivateproduct/:slug/:id/', authenticateToken,requireRole("staff"), deactivateProduct);
router.patch('/activateproduct/:slug/:id/', authenticateToken,requireRole("staff"), activateProduct);

export default router;