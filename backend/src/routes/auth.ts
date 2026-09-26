import { Router } from 'express';
import { register, login, getMe, updateMe, upgradeRole } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);
router.post('/upgrade-role', verifyToken, upgradeRole);

export default router;
