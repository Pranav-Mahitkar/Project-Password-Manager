import { z } from 'zod';

/**
 * Factory — returns a middleware that validates req.body against `schema`.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors:  result.error.flatten().fieldErrors,
    });
  }
  req.validatedBody = result.data;
  next();
};

// ── Vault schemas ─────────────────────────────────────────────

export const createVaultSchema = z.object({
  siteName:  z.string().min(1).max(128),
  siteUrl:   z.string().url().optional().or(z.literal('')),
  username:  z.string().min(1).max(256),
  password:  z.string().min(1).max(1024),
  notes:     z.string().max(2048).optional().default(''),
  category:  z.enum(['login', 'card', 'note', 'identity', 'other']).default('login'),
  isFavorite: z.boolean().default(false),
});

export const updateVaultSchema = createVaultSchema.partial();
