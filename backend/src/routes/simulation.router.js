
import { Router } from 'express';
import { simulationController } from '../controllers/simulation.controller.js';

const router = Router({ mergeParams: true });

// GET /api/groups/:groupId/simulations/:simulationId
router.get('/:simulationId', simulationController.getStatus);

// GET /api/groups/:groupId/simulations/:simulationId/download
router.get('/:simulationId/download', simulationController.download);

export default router;
