import crypto from "node:crypto";

export const RESET_CODE_TTL_MS = 10 * 60 * 1000;
export const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
export const RESET_REQUEST_WINDOW_MS = 60 * 60 * 1000;
export const MAX_RESET_REQUESTS_PER_WINDOW = 3;
export const MAX_RESET_CODE_ATTEMPTS = 5;

export function getPasswordResetSecret() {
  const secret = process.env.PASSWORD_RESET_SECRET;
  if (!secret || secret.length < 32) {
    const error = new Error("PASSWORD_RESET_SECRET must contain at least 32 characters.");
    error.code = "PASSWORD_RESET_CONFIG_MISSING";
    throw error;
  }
  return secret;
}

export function hashResetValue(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function createResetCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function createResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}
