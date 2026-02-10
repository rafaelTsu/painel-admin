import { Router } from 'express';
import * as variableController from '../controllers/variable.controller.js';

const router = Router();

router.get('/', variableController.listAll);
router.post('/', variableController.createVariable); // Global create (groupId: null)
router.post('/:id/associate', variableController.associateVariable);
router.delete('/:id/groups/:groupId', variableController.dissociateVariable);

// Also expose Update/Get for global context
router.patch('/:id', (req, res, next) => {
    // Inject null groupId for service
    req.params.groupId = null;
    variableController.updateVariable(req, res, next);
});

export const globalVariableRouter = router;
