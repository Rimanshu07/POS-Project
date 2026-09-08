const request = require('supertest');
const app = require('../app');
const dashboardRepository = require('../modules/dashboard/dashboard.repository');
const userRepository = require('../modules/users/user.repository');
const jwt = require('jsonwebtoken');

jest.mock('../modules/dashboard/dashboard.repository');
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

describe('Dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockLogic = async (id) => {
      if (id === 1) return mockAdminUser;
      if (id === 2) return mockManagerUser;
      if (id === 3) return mockCashierUser;
      return null;
    };
    userRepository.findUserById.mockImplementation(mockLogic);
    userRepository.findById.mockImplementation(mockLogic);

    dashboardRepository.getTodayMetrics.mockResolvedValue({
      todaySales: 1500.00,
      todayOrders: 5,
      productsSoldToday: 20
    });
    
    dashboardRepository.getTopProducts.mockResolvedValue([
      { product_id: 1, product_name: 'Burger', quantity_sold: 10 }
    ]);
    
    dashboardRepository.getTopCategories.mockResolvedValue([
      { category_id: 1, category_name: 'Fast Food', quantity_sold: 15 }
    ]);
    
    dashboardRepository.getPaymentBreakdown.mockResolvedValue([
      { method: 'CASH', _sum: { amount: 500.00 } },
      { method: 'CARD', _sum: { amount: 1000.00 } }
    ]);
    
    dashboardRepository.getSalesTrend.mockResolvedValue([
      { date: '2026-09-07', sales: 1500.00 }
    ]);
  });

  describe('RBAC', () => {
    it('CASHIER gets 403 Forbidden', async () => {
      const res = await request(app).get('/api/v1/dashboard').set('Cookie', `token=${cashierToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('ADMIN gets 200 OK', async () => {
      const res = await request(app).get('/api/v1/dashboard').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('MANAGER gets 200 OK', async () => {
      const res = await request(app).get('/api/v1/dashboard').set('Cookie', `token=${managerToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Formatting and Metric Logic', () => {
    it('Calculates AOV correctly when orders > 0', async () => {
      const res = await request(app).get('/api/v1/dashboard').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.aov).toBe('300.00'); // 1500 / 5
    });

    it('Returns AOV 0.00 when zero orders exist', async () => {
      dashboardRepository.getTodayMetrics.mockResolvedValue({
        todaySales: 0,
        todayOrders: 0,
        productsSoldToday: 0
      });
      const res = await request(app).get('/api/v1/dashboard').set('Cookie', `token=${adminToken}`);
      expect(res.body.data.aov).toBe('0.00');
    });

    it('Formats Payment Breakdown securely omitting missing payments as 0.00', async () => {
      const res = await request(app).get('/api/v1/dashboard').set('Cookie', `token=${adminToken}`);
      expect(res.body.data.paymentBreakdown.CASH).toBe('500.00');
      expect(res.body.data.paymentBreakdown.CARD).toBe('1000.00');
      expect(res.body.data.paymentBreakdown.UPI).toBe('0.00'); // UPI not returned by mock, should be 0.00
    });
  });

  describe('Date Filters', () => {
    it('Accepts preset filters', async () => {
      const presets = ['today', 'yesterday', 'this_week', 'this_month'];
      for (const preset of presets) {
        const res = await request(app).get(`/api/v1/dashboard?preset=${preset}`).set('Cookie', `token=${adminToken}`);
        expect(res.statusCode).toBe(200);
      }
    });

    it('Accepts valid custom from/to filters', async () => {
      const res = await request(app).get('/api/v1/dashboard?from=2026-09-01&to=2026-09-07').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('Rejects invalid from/to formats', async () => {
      const res = await request(app).get('/api/v1/dashboard?from=invalid&to=2026-09-07').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('Invalid date format');
    });

    it('Rejects from date > to date', async () => {
      const res = await request(app).get('/api/v1/dashboard?from=2026-09-07&to=2026-09-01').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('cannot be after');
    });
  });
});
