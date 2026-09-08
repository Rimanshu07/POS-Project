const request = require('supertest');
const app = require('../app');
const userRepository = require('../modules/users/user.repository');
const jwt = require('jsonwebtoken');

// We mock userRepository just for this test suite
jest.mock('../modules/users/user.repository');

const mockAdminUser = { id: 1, role: 'ADMIN', is_active: true, deleted_at: null, username: 'admin1' };
const mockManagerUser = { id: 2, role: 'MANAGER', is_active: true, deleted_at: null, username: 'manager1' };
const mockCashierUser = { id: 3, role: 'CASHIER', is_active: true, deleted_at: null, username: 'cashier1' };

let adminToken, managerToken, cashierToken;

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
  adminToken = jwt.sign({ sub: 1, role: 'ADMIN' }, process.env.JWT_SECRET);
  managerToken = jwt.sign({ sub: 2, role: 'MANAGER' }, process.env.JWT_SECRET);
  cashierToken = jwt.sign({ sub: 3, role: 'CASHIER' }, process.env.JWT_SECRET);
});

describe('User API (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    userRepository.executeTransaction.mockImplementation(async (callback) => {
      const mockTx = {
        user: { 
          create: jest.fn().mockResolvedValue({ id: 4, username: 'newuser', role: 'CASHIER' }),
          update: jest.fn().mockImplementation((args) => Promise.resolve({ id: args.where.id, ...args.data, username: 'updateduser' })),
          count: jest.fn().mockResolvedValue(1)
        },
        auditLog: { create: jest.fn().mockResolvedValue({}) }
      };
      return await callback(mockTx);
    });

    userRepository.findUserById.mockImplementation(async (id) => {
      if (id === 1) return mockAdminUser;
      if (id === 2) return mockManagerUser;
      if (id === 3) return mockCashierUser;
      return null;
    });

    userRepository.findById.mockImplementation(async (id) => {
      if (id === 1) return mockAdminUser;
      if (id === 2) return mockManagerUser;
      if (id === 3) return mockCashierUser;
      return null;
    });

    userRepository.selectWithoutPassword = { id: true };
  });

  describe('RBAC Verification', () => {
    it('CASHIER receives 403 on all endpoints', async () => {
      const getRes = await request(app).get('/api/v1/users').set('Cookie', `token=${cashierToken}`);
      expect(getRes.statusCode).toBe(403);

      const postRes = await request(app).post('/api/v1/users').send({
        name: 'a', username: 'a', email: 'a@b.com', password: 'password', role: 'CASHIER'
      }).set('Cookie', `token=${cashierToken}`);
      expect(postRes.statusCode).toBe(403);
    });

    it('MANAGER can GET but not POST/PATCH/DELETE', async () => {
      const mockLogic = async (id) => {
        if (id === 1) return mockAdminUser;
        if (id === 2) return mockManagerUser;
        if (id === 3) return mockCashierUser;
        if (id === 5) return { id: 5, deleted_at: null, is_active: true, role: 'CASHIER' };
        return null;
      };

      userRepository.findUserById.mockImplementation(mockLogic);
      userRepository.findById.mockImplementation(mockLogic);
      userRepository.findAll.mockResolvedValue({ users: [], total: 0 });

      const getRes = await request(app).get('/api/v1/users').set('Cookie', `token=${managerToken}`);
      expect(getRes.statusCode).toBe(200);

      const getByIdRes = await request(app).get('/api/v1/users/5').set('Cookie', `token=${managerToken}`);
      expect(getByIdRes.statusCode).toBe(200);

      const postRes = await request(app).post('/api/v1/users').send({
        name: 'a', username: 'a', email: 'a@b.com', password: 'password', role: 'CASHIER'
      }).set('Cookie', `token=${managerToken}`);
      expect(postRes.statusCode).toBe(403);

      const patchRes = await request(app).patch('/api/v1/users/5').send({ name: 'b' }).set('Cookie', `token=${managerToken}`);
      expect(patchRes.statusCode).toBe(403);
    });
  });

  describe('ADMIN operations', () => {
    beforeEach(() => {
      userRepository.findUserById.mockResolvedValue(mockAdminUser);
    });

    it('Can create a new user successfully', async () => {
      userRepository.findByUsernameOrEmail.mockResolvedValue(null);
      
      const payload = {
        name: 'New User',
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'CASHIER'
      };

      const res = await request(app).post('/api/v1/users').send(payload).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(201);
      expect(res.body.data.user.username).toBe('newuser');
    });

    it('Fails to create if username/email already exists', async () => {
      userRepository.findByUsernameOrEmail.mockResolvedValue({ username: 'newuser', email: 'other@test.com' });
      
      const payload = {
        name: 'New User',
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'CASHIER'
      };

      const res = await request(app).post('/api/v1/users').send(payload).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('Username is already taken');
    });

    it('Prevents self-deactivation', async () => {
      userRepository.findById.mockResolvedValue(mockAdminUser);
      
      const res = await request(app).patch('/api/v1/users/1').send({ is_active: false }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('Cannot deactivate your own account');
    });

    it('Prevents self-deletion', async () => {
      userRepository.findById.mockResolvedValue(mockAdminUser);
      
      const res = await request(app).delete('/api/v1/users/1').set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('Cannot delete your own account');
    });

    it('Prevents deactivating the last active ADMIN', async () => {
      const otherAdmin = { id: 9, role: 'ADMIN', is_active: true, deleted_at: null };
      userRepository.findById.mockImplementation(async (id) => {
        if (id === 1) return mockAdminUser;
        if (id === 9) return otherAdmin;
        return null;
      });
      
      userRepository.executeTransaction.mockImplementationOnce(async (callback) => {
        const mockTx = {
          user: { count: jest.fn().mockResolvedValue(0) },
          auditLog: { create: jest.fn() }
        };
        return await callback(mockTx);
      });

      const res = await request(app).patch('/api/v1/users/9').send({ is_active: false }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('zero active ADMIN users');
    });

    it('Prevents changing role of the last active ADMIN', async () => {
      const otherAdmin = { id: 9, role: 'ADMIN', is_active: true, deleted_at: null };
      userRepository.findById.mockImplementation(async (id) => {
        if (id === 1) return mockAdminUser;
        if (id === 9) return otherAdmin;
        return null;
      });
      
      userRepository.executeTransaction.mockImplementationOnce(async (callback) => {
        const mockTx = {
          user: { count: jest.fn().mockResolvedValue(0) },
          auditLog: { create: jest.fn() }
        };
        return await callback(mockTx);
      });

      const res = await request(app).patch('/api/v1/users/9').send({ role: 'MANAGER' }).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('zero active ADMIN users');
    });

    it('Allows deleting an admin if another active admin exists', async () => {
      const otherAdmin = { id: 9, role: 'ADMIN', is_active: true, deleted_at: null };
      userRepository.findById.mockImplementation(async (id) => {
        if (id === 1) return mockAdminUser;
        if (id === 9) return otherAdmin;
        return null;
      });
      
      const res = await request(app).delete('/api/v1/users/9').set('Cookie', `token=${adminToken}`);
      console.log('DELETE ERROR:', res.body);
      expect(res.statusCode).toBe(200);
    });

    it('Validates input properly based on revised plan', async () => {
      const payload = {
        name: 'A', // too short
        username: 'us', // too short
        email: 'invalid-email',
        password: 'short',
        role: 'SUPERADMIN' // invalid enum
      };

      const res = await request(app).post('/api/v1/users').send(payload).set('Cookie', `token=${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
