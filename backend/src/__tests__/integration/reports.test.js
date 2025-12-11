/**
 * Integration Tests - Reports API
 * 
 * Tests de endpoints de reportes con diferentes roles
 */

const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');
const Office = require('../../models/Office');
const Report = require('../../models/Report');
const db = require('../helpers/database');
const fixtures = require('../fixtures');

describe('Reports API', () => {
  let adminToken, servicedeskToken, userToken, user2Token;
  let adminUser, servicedeskUser, normalUser, user2;
  let office1, office2;

  beforeAll(async () => {
    await db.connect();
  });

  beforeEach(async () => {
    await db.clearDatabase();

    // Create users
    adminUser = await User.create(fixtures.users.admin);
    servicedeskUser = await User.create(fixtures.users.servicedesk);
    normalUser = await User.create(fixtures.users.user);
    user2 = await User.create({
      name: 'User 2',
      email: 'user2@test.com',
      password: 'User2Pass123!',
      role: 'user'
    });

    // Create offices
    office1 = await Office.create(fixtures.offices.main);
    office2 = await Office.create(fixtures.offices.branch);

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

    const user2Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user2@test.com', password: 'User2Pass123!' });
    user2Token = user2Login.body.data.accessToken;
  });

  afterAll(async () => {
    await db.closeDatabase();
  });

  describe('POST /api/reports', () => {
    test('user should create report successfully', async () => {
      const reportData = {
        category: 'hardware',
        priority: 'medium',
        title: 'Printer not working',
        description: 'Office printer is offline',
        office: office1._id.toString()
      };

      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reportData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(reportData.title);
      expect(res.body.data.status).toBe('open');
      expect(res.body.data.createdBy).toBe(normalUser._id.toString());
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/reports')
        .send({ title: 'Test' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid category', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          category: 'invalid_category',
          priority: 'medium',
          title: 'Test',
          office: office1._id.toString()
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid priority', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          category: 'hardware',
          priority: 'invalid_priority',
          title: 'Test',
          office: office1._id.toString()
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/reports', () => {
    let report1, report2, report3;

    beforeEach(async () => {
      // Create reports
      report1 = await Report.create({
        ...fixtures.reports.hardware,
        createdBy: normalUser._id,
        office: office1._id
      });

      report2 = await Report.create({
        ...fixtures.reports.software,
        createdBy: user2._id,
        office: office1._id
      });

      report3 = await Report.create({
        ...fixtures.reports.network,
        createdBy: normalUser._id,
        office: office2._id,
        assignedTo: servicedeskUser._id
      });
    });

    test('user should only see own reports', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reports).toHaveLength(2); // report1 and report3
      expect(res.body.data.reports.every(r => r.createdBy._id === normalUser._id.toString())).toBe(true);
    });

    test('servicedesk should see all reports', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reports).toHaveLength(3);
    });

    test('admin should see all reports', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reports).toHaveLength(3);
    });

    test('should filter by status', async () => {
      await Report.findByIdAndUpdate(report1._id, { status: 'resolved' });

      const res = await request(app)
        .get('/api/reports?status=resolved')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res.body.data.reports).toHaveLength(1);
      expect(res.body.data.reports[0]._id).toBe(report1._id.toString());
    });

    test('should filter by priority', async () => {
      const res = await request(app)
        .get('/api/reports?priority=critical')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res.body.data.reports).toHaveLength(1);
      expect(res.body.data.reports[0].priority).toBe('critical');
    });

    test('should filter by category', async () => {
      const res = await request(app)
        .get('/api/reports?category=hardware')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res.body.data.reports).toHaveLength(1);
      expect(res.body.data.reports[0].category).toBe('hardware');
    });

    test('should paginate results', async () => {
      // Create more reports
      for (let i = 0; i < 15; i++) {
        await Report.create({
          category: 'hardware',
          priority: 'low',
          title: `Report ${i}`,
          createdBy: normalUser._id,
          office: office1._id
        });
      }

      const res = await request(app)
        .get('/api/reports?page=1&limit=10')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res.body.data.reports).toHaveLength(10);
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('pages');
    });
  });

  describe('GET /api/reports/:id', () => {
    let report;

    beforeEach(async () => {
      report = await Report.create({
        ...fixtures.reports.hardware,
        createdBy: normalUser._id,
        office: office1._id
      });
    });

    test('user should get own report', async () => {
      const res = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(report._id.toString());
    });

    test('user should NOT get other user report', async () => {
      const res = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('servicedesk should get any report', async () => {
      const res = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('should fail with invalid ID', async () => {
      const res = await request(app)
        .get('/api/reports/invalid-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/reports/:id', () => {
    let report;

    beforeEach(async () => {
      report = await Report.create({
        ...fixtures.reports.hardware,
        createdBy: normalUser._id,
        office: office1._id
      });
    });

    test('user should update own report', async () => {
      const res = await request(app)
        .put(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated title' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated title');
    });

    test('user should NOT update other user report', async () => {
      const res = await request(app)
        .put(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hacked title' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('servicedesk should update any report', async () => {
      const res = await request(app)
        .put(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(res.body.data.status).toBe('in_progress');
    });

    test('should NOT allow changing createdBy', async () => {
      const res = await request(app)
        .put(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ createdBy: user2._id.toString() })
        .expect(200);

      // createdBy should remain unchanged
      expect(res.body.data.createdBy).toBe(normalUser._id.toString());
    });
  });

  describe('DELETE /api/reports/:id', () => {
    let report;

    beforeEach(async () => {
      report = await Report.create({
        ...fixtures.reports.hardware,
        createdBy: normalUser._id,
        office: office1._id
      });
    });

    test('admin should delete any report', async () => {
      const res = await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const deleted = await Report.findById(report._id);
      expect(deleted).toBeNull();
    });

    test('servicedesk should NOT delete reports', async () => {
      const res = await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('user should NOT delete reports', async () => {
      const res = await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/reports/:id/assign', () => {
    let report;

    beforeEach(async () => {
      report = await Report.create({
        ...fixtures.reports.hardware,
        createdBy: normalUser._id,
        office: office1._id
      });
    });

    test('servicedesk should assign report to self', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ userId: servicedeskUser._id.toString() })
        .expect(200);

      expect(res.body.data.assignedTo).toBe(servicedeskUser._id.toString());
      expect(res.body.data.status).toBe('in_progress');
    });

    test('admin should assign report to servicedesk', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: servicedeskUser._id.toString() })
        .expect(200);

      expect(res.body.data.assignedTo).toBe(servicedeskUser._id.toString());
    });

    test('user should NOT assign reports', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ userId: servicedeskUser._id.toString() })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('should NOT assign to regular user', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ userId: normalUser._id.toString() })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/reports/:id/resolve', () => {
    let report;

    beforeEach(async () => {
      report = await Report.create({
        ...fixtures.reports.hardware,
        createdBy: normalUser._id,
        office: office1._id,
        assignedTo: servicedeskUser._id,
        status: 'in_progress'
      });
    });

    test('servicedesk should resolve assigned report', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/resolve`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({ resolution: 'Fixed the hardware issue' })
        .expect(200);

      expect(res.body.data.status).toBe('resolved');
      expect(res.body.data.resolution).toBe('Fixed the hardware issue');
      expect(res.body.data.resolvedAt).toBeDefined();
    });

    test('should fail without resolution message', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/resolve`)
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('user should NOT resolve reports', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/resolve`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ resolution: 'Test' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/reports/:id/rate', () => {
    let report;

    beforeEach(async () => {
      report = await Report.create({
        ...fixtures.reports.hardware,
        createdBy: normalUser._id,
        office: office1._id,
        assignedTo: servicedeskUser._id,
        status: 'resolved',
        resolution: 'Fixed',
        resolvedAt: new Date()
      });
    });

    test('user should rate own resolved report', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5, comment: 'Excellent service!' })
        .expect(200);

      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.ratingComment).toBe('Excellent service!');
    });

    test('should fail with invalid rating', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 6 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should fail rating unresolved report', async () => {
      await Report.findByIdAndUpdate(report._id, { status: 'open' });

      const res = await request(app)
        .post(`/api/reports/${report._id}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('user should NOT rate other user report', async () => {
      const res = await request(app)
        .post(`/api/reports/${report._id}/rate`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ rating: 5 })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/reports/stats', () => {
    beforeEach(async () => {
      await Report.create([
        { ...fixtures.reports.hardware, createdBy: normalUser._id, office: office1._id, status: 'open' },
        { ...fixtures.reports.software, createdBy: normalUser._id, office: office1._id, status: 'in_progress' },
        { ...fixtures.reports.network, createdBy: user2._id, office: office2._id, status: 'resolved', rating: 5 }
      ]);
    });

    test('admin should get global stats', async () => {
      const res = await request(app)
        .get('/api/reports/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('byStatus');
      expect(res.body.data).toHaveProperty('byPriority');
      expect(res.body.data).toHaveProperty('byCategory');
      expect(res.body.data.total).toBe(3);
    });

    test('servicedesk should get global stats', async () => {
      const res = await request(app)
        .get('/api/reports/stats')
        .set('Authorization', `Bearer ${servicedeskToken}`)
        .expect(200);

      expect(res.body.data.total).toBe(3);
    });

    test('user should get own stats only', async () => {
      const res = await request(app)
        .get('/api/reports/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data.total).toBe(2); // Only normalUser's reports
    });
  });
});
