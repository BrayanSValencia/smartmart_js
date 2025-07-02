import express from 'express';
import {
  processCheckout,
  handlePaymentConfirmation,
  handleEpaycoResponse
} from '../controllers/ordercontroller.js';

const router = express.Router();

// Checkout routes
router.post('/checkout/', processCheckout);
router.post('/checkout/confirmation', handlePaymentConfirmation);
router.get('/epayco/response', handleEpaycoResponse);

export default router;