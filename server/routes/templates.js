import { Router } from 'express';
import { getTemplates, getTemplateStages } from '../controllers/templateController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/', getTemplates);
router.get('/:id/stages', getTemplateStages);

export default router;
