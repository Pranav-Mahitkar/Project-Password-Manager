import jwt from 'jsonwebtoken';
import passport from 'passport';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const issueTokens = (user) => {
  const accessToken = jwt.sign(
    { sub: user._id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { sub: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// In production the frontend (Vercel) and backend (Render) are on different
// domains, so the refresh cookie must be SameSite=None; Secure=true.
// In development both run on localhost so SameSite=Lax is fine.
const isProd = env.NODE_ENV === 'production';
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure:   isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000,
  path:     '/api/auth',
};

// GET /api/auth/google
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

// GET /api/auth/google/callback
export const googleCallback = [
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL.split(',')[0].trim()}/login?error=oauth_failed`,
  }),
  asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = issueTokens(req.user);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
    const clientUrl = env.CLIENT_URL.split(',')[0].trim();
    res.redirect(`${clientUrl}/auth/callback?token=${accessToken}`);
  }),
];

// POST /api/auth/refresh
export const refreshTokens = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token.' });

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }

  // Dynamically import to avoid circular at top-level
  const { default: User } = await import('../models/User.js');
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ success: false, message: 'User not found.' });

  const { accessToken, refreshToken: newRefresh } = issueTokens(user);
  res.cookie('refreshToken', newRefresh, REFRESH_COOKIE_OPTS);
  res.json({ success: true, accessToken, user: user.toSafeObject() });
});

// POST /api/auth/logout
export const logout = (_req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out.' });
};

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});
