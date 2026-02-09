
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.server.js';
import { User, Group, Membership, Variable, Template } from '../../src/models/index.model.js';
import { hashPassword, generateTokens } from '../../src/services/auth.service.js';
import PizZip from 'pizzip';

describe('Simulation Integration', () => {
    let attorneyToken;
    let groupId;
    let templateId;
    let versionId;

    beforeAll(async () => {
        const passwordHash = await hashPassword('password123');
        const admin = await User.create({
            name: 'Admin Sim',
            email: 'admin.sim@test.com',
            passwordHash,
            role: 'administrator'
        });
        
        const attorney = await User.create({
            name: 'Attorney Sim',
            email: 'attorney.sim@test.com',
            passwordHash,
            role: 'attorney'
        });

        const group = await Group.create({ name: 'Sim Group', description: 'Simulation Test Group' });
        groupId = group.id;

        await Membership.create({ userId: attorney.id, groupId: group.id, createdByUserId: admin.id });
        attorneyToken = generateTokens(attorney).accessToken;

        // Setup Template & Variable
        await Variable.create({
            groupId: group.id,
            key: 'client_name',
            label: 'Client Name',
            type: 'text'
        });

        const tpl = await Template.create({
            groupId,
            name: 'Simulation Template',
            createdByUserId: attorney.id
        });
        templateId = tpl.id;

        // Create Version with minimal valid DOCX structure
        const zip = new PizZip();
        
        const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

        const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

        zip.file("[Content_Types].xml", contentTypes);
        zip.file("_rels/.rels", rels);
        zip.file("word/document.xml", "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body><w:p><w:r><w:t>Hello {client_name}</w:t></w:r></w:p></w:body></w:document>");
        
        const buffer = zip.generate({ type: 'nodebuffer' });

        const res = await request(app)
            .post(`/api/groups/${groupId}/templates/${templateId}/versions`)
            .set('Authorization', `Bearer ${attorneyToken}`)
            .attach('file', buffer, 'sim_test.docx')
            .field('changeNote', 'v1');
        
        versionId = res.body.id;
    });

    describe('Run Simulation', () => {
        let simulationId;

        it('should start a simulation run', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/templates/${templateId}/versions/${versionId}/simulate`)
                .set('Authorization', `Bearer ${attorneyToken}`)
                .send({
                    inputValues: { client_name: 'Corp Inc.' },
                    outputFormat: 'docx'
                });
            
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.status).toMatch(/queued|running|succeeded/);
            simulationId = res.body.id;
        });

        it('should get simulation status', async () => {
            const res = await request(app)
                .get(`/api/groups/${groupId}/simulations/${simulationId}`)
                .set('Authorization', `Bearer ${attorneyToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(simulationId);
            expect(res.body.inputValues).toEqual({ client_name: 'Corp Inc.' });
        });

        it('should fail if variable is missing in input', async () => {
             const res = await request(app)
                .post(`/api/groups/${groupId}/templates/${templateId}/versions/${versionId}/simulate`)
                .set('Authorization', `Bearer ${attorneyToken}`)
                .send({
                    inputValues: { }, // missing client_name
                    outputFormat: 'docx'
                });
            // Depending on strictness. Assuming bad request or handled failure. 
            // If validation is strict, 400.
            expect([400, 422]).toContain(res.status);
        });
        
        // This test requires the background job to finish. Since we don't have a real worker queue yet,
        // we might process synchronously in MVP or mock the service.
        it('should download the generated document', async () => {
             const res = await request(app)
                .get(`/api/groups/${groupId}/simulations/${simulationId}/download`)
                .set('Authorization', `Bearer ${attorneyToken}`);
            
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toMatch(/application\/vnd.openxmlformats/);
        });
    });
});
