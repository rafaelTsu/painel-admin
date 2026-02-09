import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.server.js';
import { User, AuditEvent } from '../../src/models/index.model.js';
import { hashPassword } from '../../src/services/auth.service.js';

describe('Audit Integration', () => {
    let email = 'audit-test@test.com';

    beforeAll(async () => {
        const pwd = await hashPassword('password123');
        await User.create({ name: 'Audit User', email, role: 'administrator', passwordHash: pwd, isActive: true });
    });

    it('should create audit event on successful login', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email, password: 'password123' });

        if (res.status !== 200) {
            console.error('Login failed:', res.body);
        }
        expect(res.status).toBe(200);

        // Debug: fetch all audits
        const allLogs = await AuditEvent.findAll();
        // console.log('All Logs Count:', allLogs.length);

        const logs = await AuditEvent.findAll({
            where: { action: 'auth.login.success' },
            order: [['timestamp', 'DESC']]
        });
        
        expect(logs.length).toBeGreaterThan(0);
        expect(logs[0].metadata.email).toBe(email);
    });

    it('should create audit event on failed login', async () => {
         await request(app)
            .post('/api/auth/login')
            .send({ email, password: 'wrong' });

        const logs = await AuditEvent.findAll({
            where: { action: 'auth.login.failure' },
            order: [['timestamp', 'DESC']]
        });
        
        expect(logs.length).toBeGreaterThan(0);
        expect(logs[0].targetId).toBe(email);
    });
});
