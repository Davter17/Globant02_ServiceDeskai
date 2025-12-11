/**
 * Integration Tests - Authentication API
 * 
 * Tests de endpoints de autenticación
 */

const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');
const db = require('../helpers/database');
const fixtures = require('../fixtures');

describe('Auth API', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterEach(async () => {
    await db.clearDatabase();
  });

  afterAll(async () => {
    await db.closeDatabase();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'Password123!'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(userData.email.toLowerCase());
      expect(res.body.data.user.name).toBe(userData.name);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    test('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    test('should fail with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123!'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should fail with duplicate email', async () => {
      await User.create(fixtures.users.admin);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: fixtures.users.admin.email,
          password: 'Password123!'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('correo');
    });

    test('should assign default role as user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'Password123!'
        })
        .expect(201);

      expect(res.body.data.user.role).toBe('user');
    });

    test('should not allow role to be set during registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'Password123!',
          role: 'admin'
        })
        .expect(201);

      // Role should be 'user', not 'admin'
      expect(res.body.data.user.role).toBe('user');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create(fixtures.users.admin);
    });

    test('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.users.admin.email,
          password: fixtures.users.admin.password
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(fixtures.users.admin.email);
    });

    test('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.users.admin.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('credenciales');
    });

    test('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should fail with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Password123!' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should fail with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: fixtures.users.admin.email })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should fail with inactive user', async () => {
      await User.create(fixtures.users.inactive);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.users.inactive.email,
          password: fixtures.users.inactive.password
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('inactiva');
    });

    test('should return user without password field', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.users.admin.email,
          password: fixtures.users.admin.password
        })
        .expect(200);

      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.user).not.toHaveProperty('refreshTokens');
    });

    test('should be case-insensitive for email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.users.admin.email.toUpperCase(),
          password: fixtures.users.admin.password
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Register and get tokens
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'Password123!'
        });

      refreshToken = res.body.data.refreshToken;
    });

    test('should refresh access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.refreshToken).not.toBe(refreshToken); // Should get new refresh token
    });

    test('should fail with missing refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should fail with expired refresh token', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: '123' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should remove old refresh token from database', async () => {
      const user = await User.findOne({ email: 'test@test.com' });
      const initialTokenCount = user.refreshTokens.length;

      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const updatedUser = await User.findOne({ email: 'test@test.com' });
      
      // Old token should be removed, new one added
      expect(updatedUser.refreshTokens).toHaveLength(initialTokenCount);
      expect(updatedUser.refreshTokens.some(rt => rt.token === refreshToken)).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken;
    let refreshToken;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'Password123!'
        });

      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    test('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('logout');
    });

    test('should remove refresh token from database', async () => {
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      const user = await User.findOne({ email: 'test@test.com' });
      expect(user.refreshTokens.some(rt => rt.token === refreshToken)).toBe(false);
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: 'invalid-token' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken;
    let userId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'Password123!'
        });

      accessToken = res.body.data.accessToken;
      userId = res.body.data.user._id;
    });

    test('should get current user info', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(userId);
      expect(res.body.data.email).toBe('test@test.com');
      expect(res.body.data).not.toHaveProperty('password');
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
