import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: { type: String, trim: true },
    avatarUrl:   { type: String, default: null },

    // AES-256-GCM wrapped Data Encryption Key
    encryptedDEK: { type: String, required: true },
    dekIV:        { type: String, required: true },

    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Never return sensitive fields in JSON responses
UserSchema.methods.toSafeObject = function () {
  return {
    id:          this._id,
    email:       this.email,
    displayName: this.displayName,
    avatarUrl:   this.avatarUrl,
    lastLogin:   this.lastLogin,
    createdAt:   this.createdAt,
  };
};

export default mongoose.model('User', UserSchema);
