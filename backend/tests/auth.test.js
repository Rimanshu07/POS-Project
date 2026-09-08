const request = require('supertest');
const app = require('../app');
const userRepository = require('../modules/users/user.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authorizeRoles } = require('../middleware/auth.middleware');

jest.mock('../modules/users/user.repository');

const mockPasswordHash = bcrypt.hashSync('password123', 10);

const mockUser = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  password_hash: mockPasswordHash,
  role: 'ADMIN',
  is_active: true,
  deleted_at: null
};

const mockInactiveUser = {
  id: 2,
  username: 'inactive',
  password_hash: mockPasswordHash,
  role: 'CASHIER',
  is_active: false,
  deleted_at: null
};

const mockDeletedUser = {
  id: 3,
  username: 'deleted',
  password_hash: mockPasswordHash,
  role: 'MANAGER',
  is_active: true,
  deleted_at: new Date()
};

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
});

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      userRepository.findUserByEmailOrUsername.mockResolvedValue(mockUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: 'admin', password: 'password123' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.password_hash).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/token=.*; HttpOnly/);
    });

    it('should fail generically with wrong password', async () => {
      userRepository.findUserByEmailOrUsername.mockResolvedValue(mockUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: 'admin', password: 'wrongpassword' });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.error.message).toBe('Invalid credentials');
    });

    it('should fail generically with nonexistent user', async () => {
      userRepository.findUserByEmailOrUsername.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: 'nobody', password: 'password123' });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.error.message).toBe('Invalid credentials');
    });

    it('should fail to login if user is inactive', async () => {
      userRepository.findUserByEmailOrUsername.mockResolvedValue(mockInactiveUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: 'inactive', password: 'password123' });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.error.message).toBe('Invalid credentials');
    });

    it('should fail to login if user is deleted', async () => {
      userRepository.findUserByEmailOrUsername.mockResolvedValue(mockDeletedUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: 'deleted', password: 'password123' });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.error.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user info with valid cookie', async () => {
      const token = jwt.sign({ sub: 1, role: 'ADMIN' }, process.env.JWT_SECRET);
      userRepository.findUserById.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `token=${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('admin');
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    it('should reject if user is deactivated despite valid token', async () => {
      const token = jwt.sign({ sub: 2, role: 'CASHIER' }, process.env.JWT_SECRET);
      userRepository.findUserById.mockResolvedValue(mockInactiveUser);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `token=${token}`);
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.error.message).toBe('User account is inactive');
    });

    it('should reject without cookie', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear cookie', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.statusCode).toEqual(200);
      expect(res.headers['set-cookie'][0]).toMatch(/token=none/);
    });
  });

  describe('RBAC Middleware', () => {
    it('authorizeRoles should pass for allowed role', () => {
      const req = { user: { role: 'ADMIN' } };
      const next = jest.fn();
      authorizeRoles('ADMIN', 'MANAGER')(req, {}, next);
      expect(next).toHaveBeenCalledWith(); // called without arguments meaning success
    });

    it('authorizeRoles should fail for forbidden role', () => {
      const req = { user: { role: 'CASHIER' } };
      const next = jest.fn();
      authorizeRoles('ADMIN', 'MANAGER')(req, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});
