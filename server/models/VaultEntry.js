import mongoose from 'mongoose';

const VaultEntrySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Unencrypted metadata (minimal — for UI display only)
    siteName:     { type: String, required: true, trim: true, maxlength: 128 },
    siteUrl:      { type: String, trim: true, maxlength: 512, default: '' },
    category: {
      type: String,
      enum: ['login', 'card', 'note', 'identity', 'other'],
      default: 'login',
    },
    isFavorite:   { type: Boolean, default: false },
    lastUsed:     { type: Date, default: null },

    // AES-256-GCM encrypted blob  { username, password, notes }
    encryptedPayload: { type: String, required: true },
    iv:               { type: String, required: true },
    authTag:          { type: String, required: true },
  },
  { timestamps: true }
);

VaultEntrySchema.index({ owner: 1, siteName: 1 });

// Safety net — never allow queries without an owner filter
VaultEntrySchema.pre(/^find/, function () {
  if (!this.getFilter().owner) {
    throw new Error('VaultEntry queries must include an owner filter.');
  }
});

export default mongoose.model('VaultEntry', VaultEntrySchema);
