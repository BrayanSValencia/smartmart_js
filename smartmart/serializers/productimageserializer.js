// serializers/productImageSerializer.js
import { z } from 'zod';

// Input Schema
export const productImageInputSchema = z.object({
  image_url: z.string().url().max(200),
  product_id: z.number().int().positive()
});

// Output Serializer
export const productImageOutputSerializer = (image) => ({
  id: image.id,
  image_url: image.image_url,
  product_id: image.product_id,
  createdAt: image.createdAt,
  updatedAt: image.updatedAt
});