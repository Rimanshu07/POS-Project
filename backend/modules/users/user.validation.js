const { z } = require('zod');

const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']),
    is_active: z.boolean().optional().default(true)
  }).strict('Unknown fields are not allowed')
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    username: z.string().trim().min(3).max(50).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']).optional(),
    is_active: z.boolean().optional()
  }).strict('Unknown fields are not allowed').refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required to update"
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer')
  })
});

const getUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer')
  })
});

const listUserSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    search: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']).optional(),
    is_active: z.enum(['true', 'false']).optional()
  })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUserSchema
};
