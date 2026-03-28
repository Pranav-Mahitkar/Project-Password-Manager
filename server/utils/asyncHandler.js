/**
 * Wraps async route handlers so unhandled promise rejections
 * are forwarded to Express's error handler automatically.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
