const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric and can contain hyphens'),
    display_order: z.number().int().min(0).optional().default(0),
    is_active: z.boolean().optional().default(true)
  })
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    display_order: z.number().int().min(0).optional(),
    is_active: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer')
  })
});

const getCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer')
  })
});

const listCategorySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    search: z.string().optional(),
    is_active: z.enum(['true', 'false']).optional()
  })
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  listCategorySchema
};
