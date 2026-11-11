import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  codeHash: { type: String, default: null },
  attempts: { type: Number, default: 0, min: 0 },
  requestCount: { type: Number, default: 0, min: 0 },
  requestWindowStartedAt: { type: Date, default: null },
  verifiedAt: { type: Date, default: null },
  resetTokenHash: { type: String, default: null },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });

const PasswordReset = mongoose.models.PasswordReset
  || mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;
