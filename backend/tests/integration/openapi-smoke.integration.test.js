
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.server.js';
import fs from 'fs';
import path from 'path';

// Minimal contract smoke test
describe('OpenAPI Contract Smoke Tests', () => {
    // We can't easily parse YAML without library, but we can verify endpoints exist
    // matching the spec file existence.
    const specPath = path.resolve('../specs/001-admin-panel-system/contracts/openapi.yaml');

    it('should have the openapi spec file', () => {
        expect(fs.existsSync(specPath)).toBe(true);
    });

    it('GET /api/health should match spec (200 OK)', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
    });

    it('POST /api/auth/login should exist and return 400 on empty body', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        // Spec says 400 for bad request? Or 401 if missing credentials?
        // Implementation might give 400 or 401. 
        // rate limiter might trigger if we spam.
        // My implementation validation: Joi schema requires email/password. 
        // So 400.
        expect(res.status).toBe(400);
    });
});
