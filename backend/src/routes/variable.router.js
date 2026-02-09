import { Router } from 'express';
import * as variableController from '../controllers/variable.controller.js';

const router = Router({ mergeParams: true });

router.post('/', variableController.createVariable);
router.get('/', variableController.listVariables);
router.patch('/:id', variableController.updateVariable);
router.get('/:id', variableController.getVariable);

export const variableRouter = router;
