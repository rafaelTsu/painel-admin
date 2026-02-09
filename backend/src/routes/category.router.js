import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';

const router = Router({ mergeParams: true });

router.post('/', categoryController.createCategory);
router.get('/', categoryController.listCategories);
router.patch('/:id', categoryController.updateCategory);
router.get('/:id', categoryController.getCategory);
router.post('/:id/variables', categoryController.assignVariables);

export const categoryRouter = router;
