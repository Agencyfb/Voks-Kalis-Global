import crypto from "node:crypto";

const users = globalThis.__havenUsers ?? new Map();
const sessions = globalThis.__havenSessions ?? new Map();

if (!globalThis.__havenUsers) globalThis.__havenUsers = users;
if (!globalThis.__havenSessions) globalThis.__havenSessions = sessions;

const PASSWORD_ITERATIONS = 120000;

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 64, "sha512")
    .toString("hex");

  return { hash, salt };
}

export function passwordsMatch(password, user) {
  const { hash } = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.hash, "hex"));
}

export function createUser({ firstName, lastName, email, phone, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (users.has(normalizedEmail)) {
    return { error: "An account with this email already exists." };
  }

  const { hash, salt } = hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    hash,
    salt,
  };

  users.set(normalizedEmail, user);
  return { user: sanitizeUser(user) };
}

export function authenticateUser(email, password) {
  const user = users.get(email.trim().toLowerCase());

  if (!user || !passwordsMatch(password, user)) {
    return { error: "Invalid email or password." };
  }

  return { user: sanitizeUser(user) };
}

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, userId);
  return token;
}

export function getSessionUserId(token) {
  return sessions.get(token) || null;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  };
}

export const sessionCookie = {
  name: "haven_session",
  options: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};