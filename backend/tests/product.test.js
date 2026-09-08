const request = require('supertest');
const app = require('../app');
const productRepository = require('../modules/products/product.repository');
const categoryRepository = require('../modules/categories/category.repository');
const userRepository = require('../modules/users/user.repository');
const jwt = require('jsonwebtoken');

jest.mock('../modules/products/product.repository');
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

describe('Product API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/products', () => {
    it('ADMIN list products', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      productRepository.findAll.mockResolvedValue({ products: [{ id: 1, name: 'Burger' }], total: 1 });
      
      const res = await request(app).get('/api/v1/products').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(productRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({ is_active: undefined }));
    });

    it('CASHIER active-only list', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      productRepository.findAll.mockResolvedValue({ products: [{ id: 1, name: 'Burger' }], total: 1 });
      
      const res = await request(app).get('/api/v1/products').set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(200);
      expect(productRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({ is_active: true }));
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('CASHIER cannot access inactive product', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      productRepository.findById.mockResolvedValue({ id: 1, name: 'Burger', is_active: false });
      
      const res = await request(app).get('/api/v1/products/1').set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('nonexistent product returns PRODUCT_NOT_FOUND', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      productRepository.findById.mockResolvedValue(null);
      
      const res = await request(app).get('/api/v1/products/999').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('POST /api/v1/products', () => {
    it('create ADMIN with valid decimal', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findById.mockResolvedValue({ id: 1, is_active: true });
      productRepository.findBySku.mockResolvedValue(null);
      productRepository.create.mockResolvedValue({ id: 1, name: 'New Prod', sku: 'NEW-PROD', price: "19.99" });
      
      const res = await request(app).post('/api/v1/products').send({ name: 'New Prod', sku: 'new-prod', category_id: 1, price: "19.99" }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(201);
      expect(productRepository.create).toHaveBeenCalledWith(expect.objectContaining({ sku: 'NEW-PROD', price: "19.99" }));
    });

    it('create MANAGER', async () => {
      userRepository.findUserById.mockResolvedValue(mockManagerUser);
      categoryRepository.findById.mockResolvedValue({ id: 1 });
      productRepository.findBySku.mockResolvedValue(null);
      productRepository.create.mockResolvedValue({ id: 2, name: 'Prod 2', sku: 'PROD-2', price: "10" });
      
      const res = await request(app).post('/api/v1/products').send({ name: 'Prod 2', sku: 'prod-2', category_id: 1, price: "10" }).set('Cookie', `token=${managerToken}`);
      expect(res.statusCode).toBe(201);
    });

    it('CASHIER create -> 403', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      const res = await request(app).post('/api/v1/products').send({ name: 'Prod 3', sku: 'prod-3', category_id: 1, price: "5.50" }).set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('invalid price > 2 decimal places -> 400', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      const res = await request(app).post('/api/v1/products').send({ name: 'Prod 4', sku: 'prod-4', category_id: 1, price: "10.999" }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('duplicate normalized SKU -> VALIDATION_ERROR', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findById.mockResolvedValue({ id: 1 });
      productRepository.findBySku.mockResolvedValue({ id: 99 });
      
      const res = await request(app).post('/api/v1/products').send({ name: 'Cat', sku: 'bUrGer-01', category_id: 1, price: "10" }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(productRepository.findBySku).toHaveBeenCalledWith('BURGER-01');
    });

    it('nonexistent category -> CATEGORY_NOT_FOUND', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      categoryRepository.findById.mockResolvedValue(null);
      const res = await request(app).post('/api/v1/products').send({ name: 'Cat', sku: 'prod-1', category_id: 99, price: "10" }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    it('empty PATCH rejected', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      const res = await request(app).patch('/api/v1/products/1').send({}).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('update ADMIN/MANAGER', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      productRepository.findById.mockResolvedValue({ id: 1, sku: 'OLD-SKU', category_id: 1 });
      productRepository.update.mockResolvedValue({ id: 1, name: 'Updated', price: "20.00" });
      
      const res = await request(app).patch('/api/v1/products/1').send({ price: "20.00" }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('soft delete', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      productRepository.findById.mockResolvedValue({ id: 1 });
      productRepository.softDelete.mockResolvedValue({});
      
      const res = await request(app).delete('/api/v1/products/1').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(productRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('deleted product cannot be deleted', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      productRepository.findById.mockResolvedValue(null); // Repo logic ensures deleted_at=null returns null
      
      const res = await request(app).delete('/api/v1/products/1').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
