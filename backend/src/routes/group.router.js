import { Router } from 'express';
import * as groupController from '../controllers/group.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/require-role.middleware.js';
import { requireGroupMembership } from '../middlewares/require-group-membership.middleware.js';

const router = Router();

// All routes require login
router.use(authenticate);

// List/Get: accessible to attorneys too (scoped)
router.get('/', groupController.listGroups);
router.get('/:id', groupController.getGroup);

// Members listing: Scoped?
// If I am attorney in group, can I see other members? Spec doesn't say.
// For now, let's allow if you have access to group.
router.get('/:id/members', groupController.listMembers);

// Admin-only operations
router.post('/', requireRole(['administrator']), groupController.createGroup);
router.patch('/:id', requireRole(['administrator']), groupController.updateGroup);
router.delete('/:id', requireRole(['administrator']), groupController.deleteGroup);

// Membership management (Admin only per FR-012)
router.post('/:id/members', requireRole(['administrator']), groupController.addMember);
router.delete('/:id/members/:userId', requireRole(['administrator']), groupController.removeMember);

export const groupRouter = router;
