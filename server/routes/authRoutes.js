import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  googleLogin,
  googleCallback,
  refreshTokens,
  logout,
  getMe,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts.' },
});

router.get('/google',          authLimiter, googleLogin);
router.get('/google/callback', googleCallback);
router.post('/refresh',        authLimiter, refreshTokens);
router.post('/logout',         logout);
router.get('/me',              authenticate, getMe);

export default router;
