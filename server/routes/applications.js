import { Router } from 'express';
import {
    getApplications, getApplication,
    createApplication, updateApplication, deleteApplication,
    applicationRules,
} from '../controllers/applicationController.js';
import {
    getStages, addStage, moveToNextStage, stageRules,
} from '../controllers/stageController.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

// All application routes require authentication
router.use(auth);

router.get('/', getApplications);
router.get('/:id', getApplication);
router.post('/', applicationRules, validate, createApplication);
router.put('/:id', applicationRules, validate, updateApplication);
router.delete('/:id', deleteApplication);

// Stage sub-routes scoped to an application
router.get('/:id/stages', getStages);
router.post('/:id/stages', stageRules, validate, addStage);
router.patch('/:id/move-next', moveToNextStage);

export default router;
