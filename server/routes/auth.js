import { Router } from 'express';
import { register, login, getMe, registerRules, loginRules } from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', auth, getMe);

export default router;
