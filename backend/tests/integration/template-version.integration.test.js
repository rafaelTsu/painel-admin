import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.server.js';
import { User, Group, Membership, Variable } from '../../src/models/index.model.js';
import { hashPassword, generateTokens } from '../../src/services/auth.service.js';
import PizZip from 'pizzip';

describe('Template Versioning Integration', () => {
    let attorneyToken;
    let groupId;

    beforeAll(async () => {
        const passwordHash = await hashPassword('password123');
        const admin = await User.create({
            name: 'Admin TV',
            email: 'admin.tv@test.com',
            passwordHash,
            role: 'administrator'
        });
        
        const attorney = await User.create({
            name: 'Attorney TV',
            email: 'attorney.tv@test.com',
            passwordHash,
            role: 'attorney'
        });

        const group = await Group.create({ name: 'TV Group', description: 'Template Versioning Group' });
        groupId = group.id;

        await Membership.create({ userId: attorney.id, groupId: group.id, createdByUserId: admin.id });

        // Create the 'name' variable for the template
        await Variable.create({
            groupId: group.id,
            key: 'name',
            label: 'Name',
            type: 'text'
        });

        attorneyToken = generateTokens(attorney).accessToken;
    });

    describe('Template Management', () => {
        let templateId;

        it('should create a template', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/templates`)
                .set('Authorization', `Bearer ${attorneyToken}`)
                .send({
                    name: 'NDA Template',
                    description: 'Standard NDA'
                });
            
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe('NDA Template');
            templateId = res.body.id;
        });

        it('should upload a new version (docx)', async () => {
            // Create a valid docx zip buffer
            const zip = new PizZip();
            zip.file("word/document.xml", "<w:document><w:body><w:p><w:r><w:t>Hello {{name}}</w:t></w:r></w:p></w:body></w:document>");
            const buffer = zip.generate({ type: 'nodebuffer' });

            const res = await request(app)
                .post(`/api/groups/${groupId}/templates/${templateId}/versions`)
                .set('Authorization', `Bearer ${attorneyToken}`)
                .attach('file', buffer, 'test.docx')
                .field('changeNote', 'Initial version');
            
            if (res.status !== 201) {
                console.log('Upload error:', res.body);
            }
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('versionNumber', 1);
            expect(res.body.referencedVariableKeys).toContain('name');
        });

        it('should list template versions', async () => {
            const res = await request(app)
                .get(`/api/groups/${groupId}/templates/${templateId}/versions`)
                .set('Authorization', `Bearer ${attorneyToken}`);
            
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });
});
