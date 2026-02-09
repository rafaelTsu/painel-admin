import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/require-role.middleware.js';

const router = Router();

// All routes require login and ADMIN role (FR-007)
router.use(authenticate, requireRole(['administrator']));

router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
// router.delete('/:id') // Not implementing delete for now, strictly FR-007 implies deactivate.
// But we can use PATCH to deactivate.

export const userRouter = router;
