const { z } = require('zod');

// Helper for strict price validation
const priceSchema = z.string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid positive number with up to 2 decimal places')
  .refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Price must be a valid positive number');

const createProductSchema = z.object({
  body: z.object({
    category_id: z.number().int().positive('Category ID is required and must be positive'),
    name: z.string().min(1, 'Name is required').max(150),
    description: z.string().optional(),
    price: priceSchema,
    image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
    is_active: z.boolean().optional().default(true)
  })
});

const updateProductSchema = z.object({
  body: z.object({
    category_id: z.number().int().positive().optional(),
    name: z.string().min(1).max(150).optional(),
    description: z.string().optional(),
    price: priceSchema.optional(),
    image_url: z.string().url().optional().or(z.literal('')),
    is_active: z.boolean().optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: "Update request must contain at least one valid field",
    path: []
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer')
  })
});

const getProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer')
  })
});

const listProductSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    search: z.string().optional(),
    category_id: z.string().regex(/^\d+$/).optional(),
    is_active: z.enum(['true', 'false']).optional()
  })
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  listProductSchema
};
