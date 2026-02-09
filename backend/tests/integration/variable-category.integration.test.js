import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.server.js';
import { User, Group, Membership } from '../../src/models/index.model.js';
import { hashPassword, generateTokens } from '../../src/services/auth.service.js';

describe('Variable & Category Integration', () => {
    let adminToken, attorneyAToken, attorneyBToken;
    let groupA, groupB;
    let adminId, attorneyAId;

    beforeAll(async () => {
        const passwordHash = await hashPassword('password123');
        
        // Create Users
        const admin = await User.create({ email: 'admin-vc@test.com', passwordHash, role: 'administrator', name: 'Admin VC' });
        const attorneyA = await User.create({ email: 'attyA-vc@test.com', passwordHash, role: 'attorney', name: 'Atty A VC' });
        const attorneyB = await User.create({ email: 'attyB-vc@test.com', passwordHash, role: 'attorney', name: 'Atty B VC' });
        
        adminId = admin.id;
        attorneyAId = attorneyA.id;

        // Create Groups
        groupA = await Group.create({ name: 'Group VC A' });
        groupB = await Group.create({ name: 'Group VC B' });
        
        // Memberships
        await Membership.create({ userId: attorneyA.id, groupId: groupA.id, createdByUserId: admin.id });
        await Membership.create({ userId: attorneyB.id, groupId: groupB.id, createdByUserId: admin.id });
        
        // Generate Tokens
        adminToken = (await generateTokens(admin)).accessToken;
        attorneyAToken = (await generateTokens(attorneyA)).accessToken;
        attorneyBToken = (await generateTokens(attorneyB)).accessToken;
    });

    describe('Variables', () => {
        let variableId;

        it('should create a variable in Group A', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupA.id}/variables`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    key: 'clientName',
                    label: 'Client Name',
                    type: 'text'
                });
            
            expect(res.status).toBe(201);
            expect(res.body.key).toBe('clientName');
            expect(res.body.groupId).toBe(groupA.id);
            variableId = res.body.id;
        });

        it('should list variables for Group A', async () => {
            const res = await request(app)
                .get(`/api/groups/${groupA.id}/variables`)
                .set('Authorization', `Bearer ${attorneyAToken}`);
            
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.some(v => v.id === variableId)).toBe(true);
        });

        it('should NOT allow Attorney B to list Group A variables', async () => {
            const res = await request(app)
                .get(`/api/groups/${groupA.id}/variables`)
                .set('Authorization', `Bearer ${attorneyBToken}`);
            
            // Should be 403 Forbidden or 404 Not Found depending on middleware implementation preference
            // Assuming 403 as they are not a member
            expect([403, 404]).toContain(res.status);
        });
        
        it('should update a variable', async () => {
             const res = await request(app)
                .patch(`/api/groups/${groupA.id}/variables/${variableId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ label: 'Client Full Name' });
            
            expect(res.status).toBe(200);
            expect(res.body.label).toBe('Client Full Name');
        });

        it('should enforce unique key per group', async () => {
             const res = await request(app)
                .post(`/api/groups/${groupA.id}/variables`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    key: 'clientName', // Duplicate key
                    label: 'Client Name 2',
                    type: 'text'
                });
            
            expect(res.status).toBe(409); // Conflict
        });
    });

    describe('Categories', () => {
        let categoryId;
        
        it('should create a category in Group A', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupA.id}/categories`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Legal Docs'
                });
            
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Legal Docs');
            categoryId = res.body.id;
        });

        it('should assign a variable to a category', async () => {
            // Need a variable first (using the one from previous test if possible, or create new)
            // Creating a new one to be safe/independent
             const varRes = await request(app)
                .post(`/api/groups/${groupA.id}/variables`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ key: 'date', label: 'Date', type: 'text' });
            const varId = varRes.body.id;

            const res = await request(app)
                .post(`/api/groups/${groupA.id}/categories/${categoryId}/variables`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ variableIds: [varId] });
            
            expect(res.status).toBe(200);
        });
    });
});
