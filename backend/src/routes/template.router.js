import { Router } from 'express';
import * as templateController from '../controllers/template.controller.js';
import { simulationController } from '../controllers/simulation.controller.js';
import { importExportService } from '../services/import-export.service.js'; // Need controller wrapper or direct service? 
// Controller wrapper is better for req handling consistency. 
// I'll add methods to template.controller.js
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router({ mergeParams: true });

router.post('/', templateController.createTemplate);
router.get('/', templateController.listTemplates);
router.post('/import', upload.single('file'), templateController.importTemplate);
router.get('/:id', templateController.getTemplate);
router.get('/:id/export', templateController.exportTemplate);
router.post('/:id/versions', upload.single('file'), templateController.createVersion);
router.get('/:id/versions', templateController.listVersions);
router.get('/:id/versions/:versionId/html', templateController.getVersionHtml);
router.post('/:id/versions/html', templateController.createVersionFromHtml);
router.post('/:id/versions/:versionId/simulate', simulationController.createRun);

export const templateRouter = router;
