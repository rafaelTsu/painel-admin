
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.server.js';
import { User, Group, Membership, Variable, Template } from '../../src/models/index.model.js';
import { hashPassword, generateTokens } from '../../src/services/auth.service.js';
import PizZip from 'pizzip';

describe('Import/Export Integration', () => {
    let attorneyToken;
    let groupId;
    let otherGroupId;
    let templateId;
    let exportedBuffer;

    beforeAll(async () => {
        const passwordHash = await hashPassword('password123');
        const admin = await User.create({
            name: 'Admin IE',
            email: 'admin.ie@test.com',
            passwordHash,
            role: 'administrator'
        });
        
        const attorney = await User.create({
            name: 'Attorney IE',
            email: 'attorney.ie@test.com',
            passwordHash,
            role: 'attorney'
        });

        // Group 1: Source
        const group1 = await Group.create({ name: 'Source Group', description: 'Export Source' });
        groupId = group1.id;
        await Membership.create({ userId: attorney.id, groupId: group1.id, createdByUserId: admin.id });

        // Group 2: Destination
        const group2 = await Group.create({ name: 'Dest Group', description: 'Import Dest' });
        otherGroupId = group2.id;
        await Membership.create({ userId: attorney.id, groupId: group2.id, createdByUserId: admin.id });

        attorneyToken = generateTokens(attorney).accessToken;

        // Setup Template in Source
        await Variable.create({ groupId, key: 'party_a', label: 'Party A', type: 'text' });

        const tpl = await Template.create({ groupId, name: 'Exportable Template', createdByUserId: attorney.id });
        templateId = tpl.id;

        // Version
        const zip = new PizZip();
        zip.file("word/document.xml", "<w:document><w:body><w:p><w:r><w:t>{{party_a}}</w:t></w:r></w:p></w:body></w:document>");
        const buffer = zip.generate({ type: 'nodebuffer' });
         // We need the service to populate version actually, ensuring variable linkage.
         // Assuming we can use internal service or API if ready. Since US2 is done, API works.
        await request(app)
            .post(`/api/groups/${groupId}/templates/${templateId}/versions`)
            .set('Authorization', `Bearer ${attorneyToken}`)
            .attach('file', buffer, 'source.docx')
            .field('changeNote', 'v1');
    });

    it('should export a template package', async () => {
        const res = await request(app)
            .get(`/api/groups/${groupId}/templates/${templateId}/export`)
            .set('Authorization', `Bearer ${attorneyToken}`);
        
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toMatch(/application\/zip/);
        // exportedBuffer = res.body; 
    });

    it('should import a template package into another group', async () => {
        // Create a valid import package manually to ensure test isolation
        const manifest = {
            template: { name: 'Imported Template', description: 'Desc' },
            variables: [{ key: 'party_b', label: 'Party B', type: 'text' }],
            categories: [], // Optional
            versions: [
                { versionNumber: 1, changeNote: 'Init', fileName: 'v1.docx', referencedVariableKeys: ['party_b'] }
            ]
        };

        const zip = new PizZip();
        zip.file('manifest.json', JSON.stringify(manifest));
        
        // Add docx
        const docxZip = new PizZip();
        docxZip.file("word/document.xml", "<w:document><w:body><w:p><w:r><w:t>Hello {party_b}</w:t></w:r></w:p></w:body></w:document>");
        const docxBuffer = docxZip.generate({ type: 'nodebuffer' });
        zip.file('v1.docx', docxBuffer);
        
        const importBuffer = zip.generate({ type: 'nodebuffer' });

        const res = await request(app)
            .post(`/api/groups/${otherGroupId}/templates/import`)
            .set('Authorization', `Bearer ${attorneyToken}`)
            .attach('file', importBuffer, 'export.zip');
        
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toContain('Imported Template');
    });
});
