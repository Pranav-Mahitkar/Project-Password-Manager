/**
 * cryptoService.js
 *
 * All cryptographic operations live here.
 * Uses Node's built-in `crypto` module — no third-party libs.
 *
 * Key hierarchy:
 *   KEK (env var, never in DB)
 *     └─ wraps/unwraps the DEK
 *         └─ DEK (encrypted in User.encryptedDEK, raw only in RAM)
 *             └─ encrypts/decrypts VaultEntry.encryptedPayload
 */

import crypto from 'crypto';

const ALGORITHM  = 'aes-256-gcm';
const IV_BYTES   = 12;   // 96-bit IV — recommended for GCM
const TAG_BYTES  = 16;   // 128-bit auth tag
const KEY_BYTES  = 32;   // 256-bit key

// ── DEK generation ────────────────────────────────────────────

/**
 * Generate a fresh random 256-bit Data Encryption Key.
 * @returns {Buffer}
 */
export function generateDEK() {
  return crypto.randomBytes(KEY_BYTES);
}

// ── Key wrapping (KEK → DEK) ──────────────────────────────────

/**
 * Encrypt the raw DEK with the KEK.
 * @param {Buffer} dek  - Raw DEK buffer
 * @param {string} kekHex - 64-char hex KEK from env
 * @returns {{ encryptedDEK: string, iv: string }}
 */
export function wrapDEK(dek, kekHex) {
  const kek = Buffer.from(kekHex, 'hex');
  const iv  = crypto.randomBytes(IV_BYTES);

  const cipher = crypto.createCipheriv(ALGORITHM, kek, iv);
  const encrypted = Buffer.concat([cipher.update(dek), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Pack: ciphertext + tag (both fixed-length, split on unwrap)
  const packed = Buffer.concat([encrypted, tag]);

  return {
    encryptedDEK: packed.toString('base64'),
    iv:           iv.toString('base64'),
  };
}

/**
 * Decrypt the wrapped DEK back to raw bytes.
 * @param {string} encryptedDEK - Base64 packed ciphertext+tag
 * @param {string} ivBase64     - Base64 IV
 * @param {string} kekHex       - 64-char hex KEK from env
 * @returns {Buffer}  raw DEK
 */
export function unwrapDEK(encryptedDEK, ivBase64, kekHex) {
  const kek    = Buffer.from(kekHex, 'hex');
  const iv     = Buffer.from(ivBase64, 'base64');
  const packed = Buffer.from(encryptedDEK, 'base64');

  const ciphertext = packed.subarray(0, packed.length - TAG_BYTES);
  const tag        = packed.subarray(packed.length - TAG_BYTES);

  const decipher = crypto.createDecipheriv(ALGORITHM, kek, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// ── Payload encryption (DEK → VaultEntry) ────────────────────

/**
 * Encrypt a plaintext string with the user's DEK.
 * @param {string} plaintext - JSON string of { username, password, notes }
 * @param {Buffer} dek
 * @returns {{ encryptedPayload: string, iv: string, authTag: string }}
 */
export function encryptPayload(plaintext, dek) {
  const iv     = crypto.randomBytes(IV_BYTES);   // fresh IV per entry
  const cipher = crypto.createCipheriv(ALGORITHM, dek, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return {
    encryptedPayload: encrypted.toString('base64'),
    iv:               iv.toString('base64'),
    authTag:          cipher.getAuthTag().toString('base64'),
  };
}

/**
 * Decrypt a VaultEntry payload.
 * @param {string} encryptedPayload - Base64
 * @param {string} ivBase64
 * @param {string} authTagBase64
 * @param {Buffer} dek
 * @returns {string}  plaintext JSON
 */
export function decryptPayload(encryptedPayload, ivBase64, authTagBase64, dek) {
  const iv         = Buffer.from(ivBase64, 'base64');
  const authTag    = Buffer.from(authTagBase64, 'base64');
  const ciphertext = Buffer.from(encryptedPayload, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, dek, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * Helper: unwrap a user's DEK from their User document.
 * @param {object} user - Mongoose User document
 * @param {string} kekHex
 * @returns {Buffer}
 */
export function getUserDEK(user, kekHex) {
  return unwrapDEK(user.encryptedDEK, user.dekIV, kekHex);
}
