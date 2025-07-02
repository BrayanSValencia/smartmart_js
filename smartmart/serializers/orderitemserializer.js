// serializers/orderItemSerializer.js
import { z } from 'zod';

// Input Schema
export const orderItemInputSchema = z.object({
  product_id: z.number().int().positive(), 
  quantity: z.number().int().min(1),
  price: z.number().min(0.01).max(99999999.99),
  order_id: z.number().int().positive()
});

// Output Serializer remains the same
export const orderItemOutputSerializer = (item) => ({
  id: item.id,
  product_id: item.product_id,
  quantity: item.quantity,
  price: item.price,
  order_id: item.order_id,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});