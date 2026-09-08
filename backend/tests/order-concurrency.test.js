const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

describe('Order Concurrency - MySQL Race Condition Test', () => {
  let token;
  let testUser;
  let testCategory;
  let testProduct;

  beforeAll(async () => {
    // 1. Ensure clean state for orders
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    
    // 2. Setup user and product
    testUser = await prisma.user.upsert({
      where: { email: 'concurrency@example.com' },
      update: {},
      create: {
        name: 'Concurrency Tester',
        email: 'concurrency@example.com',
        username: 'concurrency_test',
        password_hash: 'hash',
        role: 'CASHIER'
      }
    });

    token = jwt.sign({ sub: testUser.id, role: testUser.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1h' });

    testCategory = await prisma.category.upsert({
      where: { slug: 'test-cat-concurrency' },
      update: {},
      create: { name: 'Test Category', slug: 'test-cat-concurrency' }
    });

    testProduct = await prisma.product.upsert({
      where: { sku: 'TEST-SKU-CONC' },
      update: { price: 10.00 },
      create: {
        name: 'Test Product',
        sku: 'TEST-SKU-CONC',
        price: 10.00,
        category_id: testCategory.id
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should generate continuous, unique, and gapless order numbers for 20 concurrent requests', async () => {
    const NUM_CONCURRENT = 20;

    const createOrderPayload = {
      items: [
        { product_id: testProduct.id, quantity: 1 }
      ],
      tax_percent: "10.00",
      payment: {
        method: 'CASH',
        amount_tendered: "100.00"
      }
    };

    // Fire 20 requests exactly simultaneously
    const requests = Array.from({ length: NUM_CONCURRENT }).map(() =>
      request(app)
        .post('/api/v1/orders')
        .set('Cookie', `token=${token}`)
        .send(createOrderPayload)
    );

    const responses = await Promise.all(requests);

    // 1. Verify all 20 succeeded
    responses.forEach((res, i) => {
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toBeDefined();
    });

    // 2. Extract order numbers
    const orderNumbers = responses.map(res => res.body.data.order.order_number);

    // 3. Verify no duplicates
    const uniqueOrderNumbers = new Set(orderNumbers);
    expect(uniqueOrderNumbers.size).toBe(NUM_CONCURRENT);

    // 4. Verify they are gapless (000001 to 000020)
    // First, find the prefix from one of the generated orders
    const prefix = orderNumbers[0].substring(0, 13); // ORD-YYYYMMDD-
    
    const sequences = orderNumbers
      .map(num => parseInt(num.split('-')[2], 10))
      .sort((a, b) => a - b);

    // The sequence should start at 1 (since we deleted all orders at the start)
    expect(sequences[0]).toBe(1);
    expect(sequences[sequences.length - 1]).toBe(NUM_CONCURRENT);

    // Check every single number to ensure no gaps
    for (let i = 0; i < NUM_CONCURRENT; i++) {
      expect(sequences[i]).toBe(i + 1);
    }
  }, 30000); // 30 second timeout for concurrency test
});
