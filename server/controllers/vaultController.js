import VaultEntry from '../models/VaultEntry.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getUserDEK,
  encryptPayload,
  decryptPayload,
} from '../services/cryptoService.js';
import { env } from '../config/env.js';

// Helper — decrypt a single entry's payload and return safe object
const decryptEntry = (entry, dek) => {
  const plaintext = decryptPayload(
    entry.encryptedPayload,
    entry.iv,
    entry.authTag,
    dek
  );
  const { username, password, notes } = JSON.parse(plaintext);

  return {
    id:         entry._id,
    siteName:   entry.siteName,
    siteUrl:    entry.siteUrl,
    category:   entry.category,
    isFavorite: entry.isFavorite,
    lastUsed:   entry.lastUsed,
    createdAt:  entry.createdAt,
    updatedAt:  entry.updatedAt,
    username,
    password,
    notes,
  };
};

// GET /api/vault  — list all entries (metadata only, no passwords)
export const listEntries = asyncHandler(async (req, res) => {
  const entries = await VaultEntry.find({ owner: req.user._id })
    .select('-encryptedPayload -iv -authTag')
    .sort({ updatedAt: -1 })
    .lean();

  res.json({ success: true, count: entries.length, entries });
});

// GET /api/vault/:id  — single entry, fully decrypted
export const getEntry = asyncHandler(async (req, res) => {
  const dek   = getUserDEK(req.user, env.SERVER_KEK);
  const entry = decryptEntry(req.vaultEntry, dek);

  // Update lastUsed timestamp
  await VaultEntry.updateOne(
    { _id: req.vaultEntry._id, owner: req.user._id },
    { lastUsed: new Date() }
  );

  res.json({ success: true, entry });
});

// POST /api/vault  — create new entry
export const createEntry = asyncHandler(async (req, res) => {
  const { siteName, siteUrl, username, password, notes, category, isFavorite } =
    req.validatedBody;

  const dek = getUserDEK(req.user, env.SERVER_KEK);
  const { encryptedPayload, iv, authTag } = encryptPayload(
    JSON.stringify({ username, password, notes }),
    dek
  );

  const entry = await VaultEntry.create({
    owner: req.user._id,
    siteName,
    siteUrl:    siteUrl ?? '',
    category,
    isFavorite,
    encryptedPayload,
    iv,
    authTag,
  });

  res.status(201).json({
    success: true,
    entry: {
      id:         entry._id,
      siteName:   entry.siteName,
      siteUrl:    entry.siteUrl,
      category:   entry.category,
      isFavorite: entry.isFavorite,
      createdAt:  entry.createdAt,
    },
  });
});

// PUT /api/vault/:id  — update entry
export const updateEntry = asyncHandler(async (req, res) => {
  const body    = req.validatedBody;
  const current = req.vaultEntry;
  const dek     = getUserDEK(req.user, env.SERVER_KEK);

  // Decrypt existing payload so we can merge partial updates
  const existing = JSON.parse(
    decryptPayload(current.encryptedPayload, current.iv, current.authTag, dek)
  );

  const merged = {
    username: body.username ?? existing.username,
    password: body.password ?? existing.password,
    notes:    body.notes    ?? existing.notes,
  };

  const { encryptedPayload, iv, authTag } = encryptPayload(
    JSON.stringify(merged),
    dek
  );

  const updated = await VaultEntry.findOneAndUpdate(
    { _id: current._id, owner: req.user._id },
    {
      ...(body.siteName    && { siteName:   body.siteName }),
      ...(body.siteUrl     !== undefined && { siteUrl: body.siteUrl }),
      ...(body.category    && { category:   body.category }),
      ...(body.isFavorite  !== undefined && { isFavorite: body.isFavorite }),
      encryptedPayload,
      iv,
      authTag,
    },
    { new: true }
  );

  res.json({
    success: true,
    entry: {
      id:         updated._id,
      siteName:   updated.siteName,
      siteUrl:    updated.siteUrl,
      category:   updated.category,
      isFavorite: updated.isFavorite,
      updatedAt:  updated.updatedAt,
    },
  });
});

// DELETE /api/vault/:id
export const deleteEntry = asyncHandler(async (req, res) => {
  await VaultEntry.deleteOne({ _id: req.vaultEntry._id, owner: req.user._id });
  res.json({ success: true, message: 'Entry deleted.' });
});

// PATCH /api/vault/:id/favorite  — toggle favorite
export const toggleFavorite = asyncHandler(async (req, res) => {
  const entry = await VaultEntry.findOneAndUpdate(
    { _id: req.vaultEntry._id, owner: req.user._id },
    [{ $set: { isFavorite: { $not: '$isFavorite' } } }],
    { new: true }
  );
  res.json({ success: true, isFavorite: entry.isFavorite });
});
