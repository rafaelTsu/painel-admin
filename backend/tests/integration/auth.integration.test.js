import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.server.js';
import { User, Group } from '../../src/models/index.model.js';
import { hashPassword, generateTokens } from '../../src/services/auth.service.js';

describe('Auth Integration', () => {
    let adminUser;
    
    beforeAll(async () => {
        // Create a test user
        const passwordHash = await hashPassword('password123');
        adminUser = await User.create({
            name: 'Admin Test',
            email: 'admin@test.com',
            passwordHash,
            role: 'administrator',
            isActive: true
        });
    });

    afterEach(async () => {
        // cleanup if needed, or transaction
    });

    it('should login successfully with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'password123'
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe('admin@test.com');
        // Check cookie
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
        expect(refreshTokenCookie).toBeDefined();
    });

    it('should fail login with invalid password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'wrongpassword'
            });
        
        // 401 Unauthorized
        expect(res.status).toBe(401);
    });

    it('should refresh token', async () => {
        // Login first to get refresh token cookie
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'password123'
            });

        const cookies = loginRes.headers['set-cookie'];
        
        const res = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', cookies);
            
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('should access /me with valid token', async () => {
        const { accessToken } = generateTokens(adminUser);
        
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${accessToken}`);
            
        expect(res.status).toBe(200);
        expect(res.body.user.id).toBe(adminUser.id);
    });
});
