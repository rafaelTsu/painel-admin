import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

import { rateLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();

router.post('/login', rateLimiter({ windowMs: 60 * 1000, max: 10 }), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export const authRouter = router;
