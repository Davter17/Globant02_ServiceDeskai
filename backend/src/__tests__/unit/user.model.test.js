/**
 * Unit Tests - User Model
 * 
 * Tests para el modelo User y sus métodos
 */

const User = require('../../models/User');
const db = require('../helpers/database');

describe('User Model', () => {
  // Setup y teardown
  beforeAll(async () => {
    await db.connect();
  });

  afterEach(async () => {
    await db.clearDatabase();
  });

  afterAll(async () => {
    await db.closeDatabase();
  });

  describe('Validation', () => {
    test('should create a valid user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'user'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email.toLowerCase());
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    test('should fail without required fields', async () => {
      const user = new User({});

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.name).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    test('should fail with invalid email', async () => {
      const user = new User({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123!'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      };

      await User.create(userData);

      let error;
      try {
        await User.create(userData);
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    test('should normalize email to lowercase', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123!'
      });

      expect(user.email).toBe('test@example.com');
    });

    test('should have default role as user', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

      expect(user.role).toBe('user');
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const plainPassword = 'Password123!';
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: plainPassword
      });

      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$/); // bcrypt hash pattern
    });

    test('should not rehash password if not modified', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

      const originalHash = user.password;
      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('matchPassword Method', () => {
    test('should return true for correct password', async () => {
      const plainPassword = 'Password123!';
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: plainPassword
      });

      const isMatch = await user.matchPassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

      const isMatch = await user.matchPassword('WrongPassword123!');
      expect(isMatch).toBe(false);
    });
  });

  describe('Refresh Tokens', () => {
    test('should add refresh token', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

      const token = 'test-refresh-token';
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      user.refreshTokens.push({ token, expiresAt });
      await user.save();

      expect(user.refreshTokens).toHaveLength(1);
      expect(user.refreshTokens[0].token).toBe(token);
    });

    test('should remove expired refresh tokens', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

      // Add expired token
      user.refreshTokens.push({
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000)
      });

      // Add valid token
      user.refreshTokens.push({
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await user.save();

      // Should have both tokens before cleanup
      expect(user.refreshTokens).toHaveLength(2);

      // Find and remove expired tokens
      user.refreshTokens = user.refreshTokens.filter(
        rt => rt.expiresAt > new Date()
      );
      await user.save();

      expect(user.refreshTokens).toHaveLength(1);
      expect(user.refreshTokens[0].token).toBe('valid-token');
    });
  });

  describe('User Statistics', () => {
    test('should count users by role', async () => {
      await User.create([
        { name: 'Admin 1', email: 'admin1@test.com', password: 'Pass123!', role: 'admin' },
        { name: 'Admin 2', email: 'admin2@test.com', password: 'Pass123!', role: 'admin' },
        { name: 'User 1', email: 'user1@test.com', password: 'Pass123!', role: 'user' },
        { name: 'User 2', email: 'user2@test.com', password: 'Pass123!', role: 'user' },
        { name: 'SD 1', email: 'sd1@test.com', password: 'Pass123!', role: 'servicedesk' }
      ]);

      const adminCount = await User.countDocuments({ role: 'admin' });
      const userCount = await User.countDocuments({ role: 'user' });
      const sdCount = await User.countDocuments({ role: 'servicedesk' });

      expect(adminCount).toBe(2);
      expect(userCount).toBe(2);
      expect(sdCount).toBe(1);
    });

    test('should count active vs inactive users', async () => {
      await User.create([
        { name: 'Active 1', email: 'active1@test.com', password: 'Pass123!', isActive: true },
        { name: 'Active 2', email: 'active2@test.com', password: 'Pass123!', isActive: true },
        { name: 'Inactive 1', email: 'inactive1@test.com', password: 'Pass123!', isActive: false }
      ]);

      const activeCount = await User.countDocuments({ isActive: true });
      const inactiveCount = await User.countDocuments({ isActive: false });

      expect(activeCount).toBe(2);
      expect(inactiveCount).toBe(1);
    });
  });

  describe('Query Performance', () => {
    test('should have index on email', async () => {
      const indexes = await User.collection.getIndexes();
      
      expect(indexes).toHaveProperty('email_1');
      expect(indexes.email_1[0][0]).toBe('email');
    });
  });
});
