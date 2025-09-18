import express from 'express';
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  getProfile,
  autoLogin,
  updateCurrency,
  getSupportedCurrencies,
  checkSetup,
  setupPassword,
  loginWithPassword
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Keep old routes for compatibility but they won't be used in single-user mode
router.post('/register', register);
router.post('/login', login);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// New auto-login route for single-user mode
router.post('/auto-login', autoLogin);
router.get('/profile', authenticateToken, getProfile);

// Currency routes
router.put('/currency', authenticateToken, updateCurrency);
router.get('/currencies', getSupportedCurrencies);

// Setup and authentication routes
router.get('/check-setup', checkSetup);
router.post('/setup-password', setupPassword);
router.post('/login-password', loginWithPassword);

export default router;