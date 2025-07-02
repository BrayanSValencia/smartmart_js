import { z } from 'zod';
import { models } from '../config/db/pool.js';

// Helper for decimal validation
const decimalSchema = z.string().transform((val, ctx) => {
  try {
    return new Decimal(val);
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid decimal value",
    });
    return z.NEVER;
  }
});

// ----- Order Item Schemas -----
export const OrderItemAfterConfirmationSchema = z.object({
  order: z.string().min(1, "Order reference is required"),
  product_id: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: decimalSchema.refine(val => val.gte(0), {
    message: "Price cannot be negative"
  }),
}).strict();

export const OrderItemSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: decimalSchema.refine(val => val.gte(0), {
    message: "Price cannot be negative"
  }),
}).strict().superRefine(async (data, ctx) => {
  // Verify product exists and price matches
  const product = await models.Product.findByPk(data.product_id);
  if (!product) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Product does not exist",
      path: ["product_id"]
    });
    return;
  }

  if (!new Decimal(product.price).equals(data.price)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Incorrect price for the product",
      path: ["price"]
    });
  }
});

// ----- Checkout Schema -----
export const checkoutSerializer = z.object({
  items: z.array(OrderItemSchema).nonempty({
    message: "At least one item is required"
  })
}).strict();

// ----- Order Schema -----
export const OrderSchema = z.object({
  invoice_id: z.string().min(1, "Invoice ID is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  sub_total: decimalSchema.refine(val => val.gte(0), {
    message: "Subtotal cannot be negative"
  }),
  tax: decimalSchema.refine(val => val.gte(0), {
    message: "Tax cannot be negative"
  }).optional(),
  tax_ico: decimalSchema.refine(val => val.gte(0), {
    message: "ICO tax cannot be negative"
  }).optional(),
  total: decimalSchema.refine(val => val.gte(0), {
    message: "Total cannot be negative"
  }),
  is_paid: z.boolean().default(false),
  user_id: z.string().min(1, "User ID is required"),
}).strict();

// Response transformers
export const OrderResponseSchema = OrderSchema.extend({
  created_at: z.date(),
  updated_at: z.date(),
}).transform(order => ({
  ...order,
  sub_total: order.sub_total.toString(),
  tax: order.tax?.toString() || "0",
  tax_ico: order.tax_ico?.toString() || "0",
  total: order.total.toString()
}));