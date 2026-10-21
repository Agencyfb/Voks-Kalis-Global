const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const REQUIRED_VARIABLES = [
  "MONGODB_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_FIRST_NAME",
  "ADMIN_LAST_NAME",
  "ADMIN_PHONE",
];

async function seedAdmin() {
  const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const password = process.env.ADMIN_PASSWORD;
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("ADMIN_PASSWORD must be 8+ characters with at least one uppercase letter and one number.");
  }

  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");

  await mongoose.connect(process.env.MONGODB_URL);
  const users = mongoose.connection.collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  await users.updateOne(
    { email },
    {
      $set: {
        firstName: process.env.ADMIN_FIRST_NAME.trim(),
        lastName: process.env.ADMIN_LAST_NAME.trim(),
        email,
        phone: process.env.ADMIN_PHONE.trim(),
        passwordHash,
        passwordSalt: salt,
        role: "admin",
      },
    },
    { upsert: true },
  );

  console.log(`Admin account seeded for ${email}.`);
}

seedAdmin()
  .catch((error) => {
    console.error(`Admin seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });