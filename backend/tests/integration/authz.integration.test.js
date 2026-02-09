import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.server.js';
import { User, Group, Membership } from '../../src/models/index.model.js';
import { hashPassword, generateTokens } from '../../src/services/auth.service.js';
import { requireRole } from '../../src/middlewares/require-role.middleware.js';
import { requireGroupMembership } from '../../src/middlewares/require-group-membership.middleware.js';
import { authenticate } from '../../src/middlewares/auth.middleware.js';

describe('Authz Integration', () => {
    let adminToken, attorneyToken, evaluatorToken;
    let testGroup;

    beforeAll(async () => {
        // Add test routes to app dynamically
        app.get('/test/admin-only', authenticate, requireRole(['administrator']), (req, res) => res.json({ msg: 'ok' }));
        app.get('/test/attorney-group/:groupId', authenticate, requireGroupMembership, (req, res) => res.json({ msg: 'ok' }));
        
        const pwd = await hashPassword('123456');

        // Admin
        const admin = await User.create({ name: 'Authz Admin', email: 'authz-admin@test.com', role: 'administrator', passwordHash: pwd, isActive: true });
        adminToken = generateTokens(admin).accessToken;

        // Attorney
        const attorney = await User.create({ name: 'Authz Atty', email: 'authz-atty@test.com', role: 'attorney', passwordHash: pwd, isActive: true });
        attorneyToken = generateTokens(attorney).accessToken;

        // Evaluator
        const evaluator = await User.create({ name: 'Authz Eval', email: 'authz-eval@test.com', role: 'evaluator', passwordHash: pwd, isActive: true });
        evaluatorToken = generateTokens(evaluator).accessToken;

        // Group
        testGroup = await Group.create({ name: 'Authz Group', description: 'Test', isActive: true });
        
        // Membership
        await Membership.create({ userId: attorney.id, groupId: testGroup.id, createdByUserId: admin.id });
    });

    it('should allow admin to admin-only route', async () => {
        const res = await request(app)
            .get('/test/admin-only')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
    });

    it('should deny attorney to admin-only route', async () => {
        const res = await request(app)
            .get('/test/admin-only')
            .set('Authorization', `Bearer ${attorneyToken}`);
        expect(res.status).toBe(403);
    });

    it('should allow attorney to grouped route if member', async () => {
        const res = await request(app)
            .get(`/test/attorney-group/${testGroup.id}`)
            .set('Authorization', `Bearer ${attorneyToken}`);
        expect(res.status).toBe(200);
    });

    it('should deny attorney to grouped route if NOT member', async () => {
        const otherGroup = await Group.create({ name: 'Other Group', description: 'desc', isActive: true });
        const res = await request(app)
            .get(`/test/attorney-group/${otherGroup.id}`)
            .set('Authorization', `Bearer ${attorneyToken}`);
        expect(res.status).toBe(403);
    });

    it('should deny evaluator', async () => {
         const res = await request(app)
            .get('/test/admin-only')
            .set('Authorization', `Bearer ${evaluatorToken}`);
        expect(res.status).toBe(403);
    });
});
