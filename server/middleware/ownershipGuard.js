import VaultEntry from '../models/VaultEntry.js';

/**
 * Ensures the authenticated user owns the requested VaultEntry.
 * Attaches `req.vaultEntry` for downstream controllers.
 */
export const ownershipGuard = async (req, res, next) => {
  try {
    const entry = await VaultEntry.findOne({
      _id:   req.params.id,
      owner: req.user._id,
    });

    if (!entry) {
      // Return 404 (not 403) to avoid leaking that the resource exists
      return res.status(404).json({ success: false, message: 'Vault entry not found.' });
    }

    req.vaultEntry = entry;
    next();
  } catch (err) {
    next(err);
  }
};
