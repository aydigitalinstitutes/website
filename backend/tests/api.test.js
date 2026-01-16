const request = require('supertest');
const app = require('../index');
const { pool } = require('../config/db');

describe('API Endpoints', () => {
  let server;

  beforeAll(() => {
    // Start server if not running
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Authentication', () => {
    let testEmail = `test_${Date.now()}@example.com`;
    let testPassword = 'password123';

    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: testEmail,
          password: testPassword
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testEmail);
    });

    it('should login the user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testEmail);
    });

    it('should send OTP', async () => {
      const res = await request(app)
        .post('/api/otp/send')
        .send({ email: testEmail });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Site Settings', () => {
    it('should fetch settings', async () => {
      const res = await request(app).get('/api/settings');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.settings).toHaveProperty('brand_name');
    }, 10000); // Increased timeout

    it('should update settings', async () => {
      const newSettings = { brand_name: 'Test Institute' };
      const res = await request(app)
        .post('/api/settings')
        .send({ settings: newSettings });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify update
      const check = await request(app).get('/api/settings');
      expect(check.body.settings.brand_name).toBe('Test Institute');
    }, 10000);
  }); // Close Site Settings describe block

  describe('User Management', () => {
    let newUserId;

    it('should create a new user (admin action)', async () => {
      const res = await request(app)
        .post('/api/users/create')
        .send({
          name: 'New Student',
          email: `student_${Date.now()}@test.com`,
          password: 'password123',
          role: 'student'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      newUserId = res.body.user.id;
    });

    it('should list all users', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(200);
      expect(res.body.users.length).toBeGreaterThan(0);
    });

    it('should reset user password (admin action)', async () => {
      const res = await request(app)
        .post('/api/users/reset-password')
        .send({ userId: newUserId, newPassword: 'newpassword123' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should change own password (user action)', async () => {
      const res = await request(app)
        .post('/api/change-password')
        .send({ 
          userId: newUserId, 
          oldPassword: 'newpassword123', 
          newPassword: 'finalpassword123' 
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
