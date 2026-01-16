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
  });
});
