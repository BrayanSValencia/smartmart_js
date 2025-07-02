import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  retrieveCategory,
  deactivateCategory
} from '../controllers/categorycontroller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/listcategories/', getCategories);

router.post('/createcategory/', authenticateToken,requireRole("staff"), createCategory);

router.get('/retrievecategory/:slug',authenticateToken,  retrieveCategory);

router.put('/updatecategory/:slug/:id',authenticateToken,requireRole("staff"),  updateCategory);

router.delete('/deletecategory/:slug/:id',authenticateToken,requireRole("staff"),  deleteCategory);

router.patch('/deletecategory/:slug/:id',authenticateToken,requireRole("staff"),  deactivateCategory);

export default router;