import express from 'express';
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  getProfile
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateToken, getProfile);

export default router;