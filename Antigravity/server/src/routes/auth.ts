import { Router } from 'express';
import { register, login, deleteAccount } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.delete('/account', authenticateToken, deleteAccount);

export default router;
