// serializers/productSerializer.js
import { z } from 'zod';

// Input Schema
export const productInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string(),
  price: z.number().min(0),
  stock_quantity: z.number().int().min(0),
  category_id: z.number().int()
});

// Output Serializer
export const productOutputSerializer = (product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price,
  stock_quantity: product.stock_quantity,
  category: product.categoryId.name,
  isActive: product.isActive,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});