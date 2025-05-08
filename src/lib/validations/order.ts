import { z } from 'zod';
import { OrderStatus } from '@/types/enums';

// Validation schema for order details
export const orderDetailsSchema = z.object({
  totalQuantity: z.number().int().positive().optional(),
  shippedQuantity: z.number().int().nonnegative().optional(),
  largeItemQuantity: z.number().int().nonnegative().optional(),
  smallItemQuantity: z.number().int().nonnegative().optional(),
  priceRMB: z.number().nonnegative().optional(),
  priceTonggur: z.number().nonnegative().optional(),
  deliveryAvailable: z.boolean().optional(),
  comments: z.string().optional(),
});

// Validation schema for PUT request (update order)
export const updateOrderSchema = z.object({
  orderId: z.string().optional(),
  packageId: z.string().optional(),
  phoneNumber: z.string().optional(),
  isShipped: z.boolean().optional(),
  isDamaged: z.boolean().optional(),
  damageDescription: z.string().optional().nullable(),
  status: z.nativeEnum(OrderStatus),
  orderDetails: orderDetailsSchema.optional(),
  createdAt: z.string().datetime().optional(),
});

// Validation schema for PATCH request (update status)
export const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// Type inference
export type OrderDetailsInput = z.infer<typeof orderDetailsSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>; 