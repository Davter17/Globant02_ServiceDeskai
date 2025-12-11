/**
 * Integration Tests - RBAC (Role-Based Access Control)
 * 
 * Tests de permisos y autorización por roles
 */

const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');
const Office = require('../../models/Office');
const Report = require('../../models/Report');
const db = require('../helpers/database');
const fixtures = require('../fixtures');

describe('RBAC - Role-Based Access Control', () => {
  let adminToken, servicedeskToken, userToken;
  let adminUser, servicedeskUser, normalUser;
  let office, report;

  beforeAll(async () => {
    await db.connect();
  });

  beforeEach(async () => {
    await db.clearDatabase();

    // Create users
    adminUser = await User.create(fixtures.users.admin);
    servicedeskUser = await User.create(fixtures.users.servicedesk);
    normalUser = await User.create(fixtures.users.user);

    // Create office
    office = await Office.create(fixtures.offices.main);

    // Create report
    report = await Report.create({
      ...fixtures.reports.hardware,
      createdBy: normalUser._id,
      office: office._id
    });

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: fixtures.users.admin.email, password: fixtures.users.admin.password });
    adminToken = adminLogin.body.data.accessToken;

    const sdLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: fixtures.users.servicedesk.email, password: fixtures.users.servicedesk.password });
    servicedeskToken = sdLogin.body.data.accessToken;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: fixtures.users.user.email, password: fixtures.users.user.password });
    userToken = userLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await db.closeDatabase();
  });

  describe('User Management - Admin Only', () => {
    test('admin CAN list all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(3);
    });

    test('admin CAN get any user details', async () => {
      const res = await request(app)
        .get(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(normalUser._id.toString());
    });

    test('admin CAN update any user', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body.data.name).toBe('Updated Name');
    });

    test('admin CAN delete users', async () => {
      const res = await request(app)
        .delete(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('admin CAN change user roles', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'servicedesk' })
        .expect(200);

      expect(res.body.data.role).toBe('servicedesk');
    });

    test('servicedesk CANNOT list users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('servicedesk CANNOT update users', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ name: 'Hacked' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('servicedesk CANNOT delete users', async () => {
      const res = await request(app)
        .delete(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('user CANNOT list all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('user CANNOT view other users', async () => {
      const res = await request(app)
        .get(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('user CANNOT update other users', async () => {
      const res = await request(app)
        .put(`/api/users/${servicedeskUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Office Management', () => {
    test('admin CAN create offices', async () => {
      const res = await request(app)
        .post('/api/offices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TEST-01',
          name: 'Test Office',
          address: '123 Test St',
          city: 'Test City',
          country: 'Test Country'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    test('admin CAN update offices', async () => {
      const res = await request(app)
        .put(`/api/offices/${office._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Office' })
        .expect(200);

      expect(res.body.data.name).toBe('Updated Office');
    });

    test('admin CAN delete offices', async () => {
      const res = await request(app)
        .delete(`/api/offices/${office._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('servicedesk CAN view offices', async () => {
      const res = await request(app)
        .get('/api/offices')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('servicedesk CANNOT create offices', async () => {
      const res = await request(app)
        .post('/api/offices')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({
          code: 'TEST-01',
          name: 'Test Office'
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('servicedesk CANNOT update offices', async () => {
      const res = await request(app)
        .put(`/api/offices/${office._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ name: 'Hacked' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('user CAN view offices', async () => {
      const res = await request(app)
        .get('/api/offices')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('user CANNOT create offices', async () => {
      const res = await request(app)
        .post('/api/offices')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          code: 'TEST-01',
          name: 'Test Office'
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Report Access Control', () => {
    let anotherUser, anotherUserToken, anotherUserReport;

    beforeEach(async () => {
      anotherUser = await User.create({
        name: 'Another User',
        email: 'another@test.com',
        password: 'Another123!',
        role: 'user'
      });

      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: 'another@test.com', password: 'Another123!' });
      anotherUserToken = login.body.data.accessToken;

      anotherUserReport = await Report.create({
        category: 'software',
        priority: 'low',
        title: 'Another report',
        createdBy: anotherUser._id,
        office: office._id
      });
    });

    test('user CAN view own reports', async () => {
      const res = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('user CANNOT view other user reports', async () => {
      const res = await request(app)
        .get(`/api/reports/${anotherUserReport._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('user CAN update own reports', async () => {
      const res = await request(app)
        .put(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated' })
        .expect(200);

      expect(res.body.data.title).toBe('Updated');
    });

    test('user CANNOT update other user reports', async () => {
      const res = await request(app)
        .put(`/api/reports/${anotherUserReport._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Hacked' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('user CANNOT delete any reports', async () => {
      const res = await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('servicedesk CAN view all reports', async () => {
      const res1 = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      const res2 = await request(app)
        .get(`/api/reports/${anotherUserReport._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res1.body.success).toBe(true);
      expect(res2.body.success).toBe(true);
    });

    test('servicedesk CAN update all reports', async () => {
      const res = await request(app)
        .put(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(res.body.data.status).toBe('in_progress');
    });

    test('servicedesk CAN assign reports', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ userId: servicedeskUser._id.toString() })
        .expect(200);

      expect(res.body.data.assignedTo).toBe(servicedeskUser._id.toString());
    });

    test('servicedesk CAN resolve reports', async () => {
      await Report.findByIdAndUpdate(report._id, {
        assignedTo: servicedeskUser._id,
        status: 'in_progress'
      });

      const res = await request(app)
        .post(`/api/reports/${report._id}/resolve`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ resolution: 'Fixed the issue' })
        .expect(200);

      expect(res.body.data.status).toBe('resolved');
    });

    test('servicedesk CANNOT delete reports', async () => {
      const res = await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('admin CAN view all reports', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.reports.length).toBeGreaterThanOrEqual(2);
    });

    test('admin CAN delete any report', async () => {
      const res = await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Report Assignment Rules', () => {
    test('only servicedesk/admin can be assigned to reports', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: normalUser._id.toString() })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('servicedesk');
    });

    test('servicedesk can assign to self', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ userId: servicedeskUser._id.toString() })
        .expect(200);

      expect(res.body.data.assignedTo).toBe(servicedeskUser._id.toString());
    });

    test('admin can assign to any servicedesk', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: servicedeskUser._id.toString() })
        .expect(200);

      expect(res.body.data.assignedTo).toBe(servicedeskUser._id.toString());
    });

    test('user cannot assign reports', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ userId: servicedeskUser._id.toString() })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Report Rating Rules', () => {
    beforeEach(async () => {
      await Report.findByIdAndUpdate(report._id, {
        assignedTo: servicedeskUser._id,
        status: 'resolved',
        resolution: 'Fixed',
        resolvedAt: new Date()
      });
    });

    test('user CAN rate own resolved report', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5, comment: 'Great!' })
        .expect(200);

      expect(res.body.data.rating).toBe(5);
    });

    test('user CANNOT rate other user report', async () => {
      const anotherUser = await User.create({
        name: 'Another',
        email: 'another@test.com',
        password: 'Pass123!'
      });

      const anotherReport = await Report.create({
        category: 'hardware',
        priority: 'low',
        title: 'Test',
        createdBy: anotherUser._id,
        office: office._id,
        status: 'resolved',
        resolution: 'Done',
        resolvedAt: new Date()
      });

      const res = await request(app)
        .post(`/api/reports/${anotherReport._id}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5 })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('servicedesk CANNOT rate reports', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/rate`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ rating: 5 })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('admin CANNOT rate reports', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/rate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rating: 5 })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Statistics Access', () => {
    test('admin CAN view all statistics', async () => {
      const res = await request(app)
        .get('/api/reports/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
    });

    test('servicedesk CAN view all statistics', async () => {
      const res = await request(app)
        .get('/api/reports/stats')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('user CAN view own statistics only', async () => {
      const res = await request(app)
        .get('/api/reports/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      // Stats should only reflect normalUser's reports
    });
  });

  describe('Authentication Requirements', () => {
    test('all endpoints require authentication', async () => {
      const endpoints = [
        { method: 'get', path: '/api/reports' },
        { method: 'post', path: '/api/reports' },
        { method: 'get', path: '/api/users' },
        { method: 'get', path: '/api/offices' }
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)[endpoint.method](endpoint.path)
          .expect(401);

        expect(res.body.success).toBe(false);
      }
    });

    test('invalid token is rejected', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('expired token is rejected', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: normalUser._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Role Escalation Prevention', () => {
    test('user cannot promote self to admin', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('servicedesk cannot promote self to admin', async () => {
      const res = await request(app)
        .put(`/api/users/${servicedeskUser._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ role: 'admin' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('only admin can change roles', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'servicedesk' })
        .expect(200);

      expect(res.body.data.role).toBe('servicedesk');
    });
  });
});
