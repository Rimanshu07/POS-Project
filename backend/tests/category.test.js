const request = require('supertest');
const app = require('../app');
const categoryRepository = require('../modules/categories/category.repository');
const userRepository = require('../modules/users/user.repository');
const jwt = require('jsonwebtoken');

jest.mock('../modules/categories/category.repository');
jest.mock('../modules/users/user.repository');

const mockAdminUser = { id: 1, role: 'ADMIN', is_active: true, deleted_at: null };
const mockManagerUser = { id: 2, role: 'MANAGER', is_active: true, deleted_at: null };
const mockCashierUser = { id: 3, role: 'CASHIER', is_active: true, deleted_at: null };

let adminToken, managerToken, cashierToken;

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
  adminToken = jwt.sign({ sub: 1, role: 'ADMIN' }, process.env.JWT_SECRET);
  managerToken = jwt.sign({ sub: 2, role: 'MANAGER' }, process.env.JWT_SECRET);
  cashierToken = jwt.sign({ sub: 3, role: 'CASHIER' }, process.env.JWT_SECRET);
});

describe('Category API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/categories', () => {
    it('ADMIN list categories', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findAll.mockResolvedValue({ categories: [{ id: 1, name: 'Burger' }], total: 1 });
      
      const res = await request(app).get('/api/v1/categories').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(categoryRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({ is_active: undefined }));
    });

    it('CASHIER active-only list', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      categoryRepository.findAll.mockResolvedValue({ categories: [{ id: 1, name: 'Burger' }], total: 1 });
      
      const res = await request(app).get('/api/v1/categories').set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(200);
      expect(categoryRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({ is_active: true }));
    });

    it('Pagination and search parameters work', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findAll.mockResolvedValue({ categories: [], total: 0 });
      
      const res = await request(app).get('/api/v1/categories?page=2&limit=5&search=pizza').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(categoryRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
        page: 2, limit: 5, skip: 5, take: 5, search: 'pizza'
      }));
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should return category', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findById.mockResolvedValue({ id: 1, name: 'Burger', is_active: true });
      
      const res = await request(app).get('/api/v1/categories/1').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.category.name).toBe('Burger');
    });

    it('CASHIER cannot access inactive category', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      categoryRepository.findById.mockResolvedValue({ id: 1, name: 'Burger', is_active: false });
      
      const res = await request(app).get('/api/v1/categories/1').set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('nonexistent category returns CATEGORY_NOT_FOUND', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findById.mockResolvedValue(null);
      
      const res = await request(app).get('/api/v1/categories/999').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
    });
  });

  describe('POST /api/v1/categories', () => {
    it('create ADMIN', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findBySlug.mockResolvedValue(null);
      categoryRepository.create.mockResolvedValue({ id: 1, name: 'New Cat', slug: 'new-cat' });
      
      const res = await request(app).post('/api/v1/categories').send({ name: 'New Cat', slug: 'new-cat' }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(201);
      expect(categoryRepository.create).toHaveBeenCalled();
    });

    it('create MANAGER', async () => {
      userRepository.findUserById.mockResolvedValue(mockManagerUser);
      categoryRepository.findBySlug.mockResolvedValue(null);
      categoryRepository.create.mockResolvedValue({ id: 2, name: 'Cat 2', slug: 'cat-2' });
      
      const res = await request(app).post('/api/v1/categories').send({ name: 'Cat 2', slug: 'cat-2' }).set('Cookie', `token=${managerToken}`);
      expect(res.statusCode).toBe(201);
    });

    it('CASHIER create -> 403', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      const res = await request(app).post('/api/v1/categories').send({ name: 'Cat 3', slug: 'cat-3' }).set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('duplicate slug validation error', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findBySlug.mockResolvedValue({ id: 99 });
      
      const res = await request(app).post('/api/v1/categories').send({ name: 'Cat', slug: 'cat' }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('DB unique-constraint slug failure', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findBySlug.mockResolvedValue(null);
      categoryRepository.create.mockRejectedValue({ code: 'P2002', meta: { target: ['slug'] } });
      
      const res = await request(app).post('/api/v1/categories').send({ name: 'Cat', slug: 'cat' }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Zod validation -> 400', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      // missing slug
      const res = await request(app).post('/api/v1/categories').send({ name: 'Cat' }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/categories/:id', () => {
    it('update ADMIN/MANAGER', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findById.mockResolvedValue({ id: 1, slug: 'old' });
      categoryRepository.update.mockResolvedValue({ id: 1, name: 'Updated' });
      
      const res = await request(app).patch('/api/v1/categories/1').send({ name: 'Updated' }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('deleted category cannot be updated', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findById.mockResolvedValue(null); // findById excludes deleted
      
      const res = await request(app).patch('/api/v1/categories/1').send({ name: 'Updated' }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
    });

    it('CASHIER update -> 403', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      const res = await request(app).patch('/api/v1/categories/1').send({ name: 'Updated' }).set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('soft delete', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findById.mockResolvedValue({ id: 1 });
      categoryRepository.softDelete.mockResolvedValue({});
      
      const res = await request(app).delete('/api/v1/categories/1').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(categoryRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('CASHIER delete -> 403', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      const res = await request(app).delete('/api/v1/categories/1').set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('deleted category cannot be deleted', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findById.mockResolvedValue(null);
      
      const res = await request(app).delete('/api/v1/categories/1').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
