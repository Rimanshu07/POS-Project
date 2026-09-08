const request = require('supertest');
const app = require('../app');
const orderRepository = require('../modules/orders/order.repository');
const userRepository = require('../modules/users/user.repository');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');

jest.mock('../modules/orders/order.repository');
jest.mock('../modules/users/user.repository');

const mockAdminUser = { id: 1, role: 'ADMIN', is_active: true, deleted_at: null };
const mockCashierUser = { id: 3, role: 'CASHIER', is_active: true, deleted_at: null };

let adminToken, cashierToken;

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
  adminToken = jwt.sign({ sub: 1, role: 'ADMIN' }, process.env.JWT_SECRET);
  cashierToken = jwt.sign({ sub: 3, role: 'CASHIER' }, process.env.JWT_SECRET);
});

describe('Order API (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for transaction execution
    orderRepository.executeTransaction.mockImplementation(async (callback) => {
      // Create a mock transaction object
      const mockTx = {
        $executeRaw: jest.fn().mockResolvedValue([]),
        order: { create: jest.fn().mockResolvedValue({ id: 101, order_number: 'ORD-20260907-000001', total_amount: new Prisma.Decimal('118.00') }) },
        auditLog: { create: jest.fn().mockResolvedValue({}) }
      };
      return await callback(mockTx);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('CASHIER can list orders', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      orderRepository.findAll.mockResolvedValue({ orders: [], total: 0 });
      
      const res = await request(app).get('/api/v1/orders').set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(200);
      expect(orderRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('returns order details', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      orderRepository.findById.mockResolvedValue({ id: 1, order_number: 'ORD-123' });
      
      const res = await request(app).get('/api/v1/orders/1').set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.order.order_number).toBe('ORD-123');
    });

    it('returns 404 for non-existent order', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      orderRepository.findById.mockResolvedValue(null);
      
      const res = await request(app).get('/api/v1/orders/99').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('POST /api/v1/orders', () => {
    it('successful CASH order creation with change', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      
      // Mock db products
      orderRepository.getProductsForOrder.mockResolvedValue([
        { id: 1, name: 'Burger', price: new Prisma.Decimal('100.00'), is_active: true, deleted_at: null }
      ]);
      orderRepository.generateOrderNumber.mockResolvedValue('ORD-20260907-000001');

      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
        payment: { method: 'CASH', amount_tendered: '150.00' },
        tax_percent: '18.00' // Subtotal 100, Tax 18, Total 118
      };
      
      const res = await request(app).post('/api/v1/orders').send(payload).set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(201);
      
      // 150 tendered - 118 total = 32 change
      expect(res.body.data.change_amount).toBe('32.00');
    });

    it('insufficient CASH throws VALIDATION_ERROR', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      orderRepository.getProductsForOrder.mockResolvedValue([
        { id: 1, name: 'Burger', price: new Prisma.Decimal('100.00'), is_active: true, deleted_at: null }
      ]);
      
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
        payment: { method: 'CASH', amount_tendered: '100.00' }, // Total is 118, 100 is insufficient
        tax_percent: '18.00'
      };
      
      const res = await request(app).post('/api/v1/orders').send(payload).set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('Amount tendered is less than total amount');
    });

    it('CARD exact payment successful without amount_tendered', async () => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
      orderRepository.getProductsForOrder.mockResolvedValue([
        { id: 1, name: 'Burger', price: new Prisma.Decimal('100.00'), is_active: true, deleted_at: null }
      ]);
      orderRepository.generateOrderNumber.mockResolvedValue('ORD-20260907-000002');
      
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
        payment: { method: 'CARD' }
      };
      
      const res = await request(app).post('/api/v1/orders').send(payload).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(201);
    });

    it('CASH missing amount_tendered throws 400 Zod error', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
        payment: { method: 'CASH' } // Missing amount_tendered
      };
      
      const res = await request(app).post('/api/v1/orders').send(payload).set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('missing/invalid product throws PRODUCT_NOT_FOUND', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      orderRepository.getProductsForOrder.mockResolvedValue([]); // Product not found in DB
      
      const payload = {
        items: [{ product_id: 99, quantity: 1 }],
        payment: { method: 'CARD' }
      };
      
      const res = await request(app).post('/api/v1/orders').send(payload).set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('inactive product throws VALIDATION_ERROR', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      orderRepository.getProductsForOrder.mockResolvedValue([
        { id: 1, name: 'Burger', price: new Prisma.Decimal('100.00'), is_active: false, deleted_at: null }
      ]);
      
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
        payment: { method: 'CARD' }
      };
      
      const res = await request(app).post('/api/v1/orders').send(payload).set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('is inactive or deleted');
    });

    it('discount fields are rejected with VALIDATION_ERROR due to strict mode', async () => {
      userRepository.findUserById.mockResolvedValue(mockCashierUser);
      
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
        payment: { method: 'CARD' },
        discount_amount: "50.00" // Not in schema, will be rejected by .strict()
      };
      
      const res = await request(app).post('/api/v1/orders').send(payload).set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
