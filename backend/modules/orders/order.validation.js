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
    tax_percent: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Tax percent must be a valid number with up to 2 decimal places')
      .optional()
      .default('18.00'),
    payment: z.object({
      method: z.enum(['CASH', 'CARD', 'UPI', 'NEFT', 'RTGS', 'OTHERS']),
      amount_tendered: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Amount tendered must be a valid positive number with up to 2 decimal places')
        .optional()
    }).refine(data => {
      if (data.method === 'CASH') {
        return !!data.amount_tendered;
      }
      return true;
    }, {
      message: "amount_tendered is required for CASH payment",
      path: ['amount_tendered']
    })
  }).strict('Unknown fields are not allowed. Discount is not supported in V1.')
});

// Schema for Order Listing
const listOrderSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    search: z.string().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    reference_no: z.string().optional(),
    invoice_no: z.string().optional(),
    payment_status: z.enum(['PAID', 'PENDING', 'PARTIAL', 'DUE', 'FAILED']).optional()
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
