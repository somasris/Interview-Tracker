import { Router } from 'express';
import {
    updateStage, completeStage, deleteStage, updateStageRules,
} from '../controllers/stageController.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(auth);

router.put('/:id', updateStageRules, validate, updateStage);
router.patch('/:id/complete', completeStage);
router.delete('/:id', deleteStage);

export default router;
