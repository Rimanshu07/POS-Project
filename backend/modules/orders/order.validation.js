const { z } = require('zod');

// Schema for Order Creation
const createOrderSchema = z.object({
  body: z.object({
    order_number: z.string().optional(),
    items: z.array(
      z.object({
        product_id: z.number().int().positive('Product ID must be valid'),
        quantity: z.number().int().positive('Quantity must be at least 1')
      })
    ).min(1, 'Order must contain at least one item'),
    discount_amount: z.number().nonnegative().optional(),
    discount_type: z.enum(['FLAT', 'PERCENT']).optional(),
    discount_rate: z.number().nonnegative().optional(),
    payment: z.array(z.object({
      method: z.enum(['CASH', 'CARD', 'UPI', 'NEFT', 'RTGS', 'OTHERS']),
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Payment amount must be valid'),
      amount_tendered: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Amount tendered must be a valid positive number with up to 2 decimal places')
        .optional()
    })).optional()
  }).strict('Unknown fields are not allowed.')
});

// Schema for Order Listing
const listOrderSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    search: z.string().optional(),
    status: z.string().toUpperCase().pipe(z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'PARTIAL'])).optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    reference_no: z.string().optional(),
    invoice_no: z.string().optional(),
    payment_status: z.string().toUpperCase().pipe(z.enum(['PAID', 'PENDING', 'FAILED', 'REFUNDED', 'PARTIAL'])).optional()
  })
});

// Schema for Get Order by ID
const getOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer')
  })
});

module.exports = {
  createOrderSchema,
  listOrderSchema,
  getOrderSchema
};
