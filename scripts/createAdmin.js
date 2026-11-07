/**
 * Create (or reset) a local admin user.
 * Usage: node scripts/createAdmin.js
 * Optional env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { User } = require("../server/models");

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI missing in .env");
  }

  const email = (process.env.ADMIN_EMAIL || "admin@quickcare.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "QuickCare Admin";

  await mongoose.connect(process.env.MONGODB_URI);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      passwordHash,
      role: "admin",
      phone: "",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log(`Admin ready: ${user.email} (role=${user.role})`);
  console.log("Log in with the password you set (default admin123).");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  try {
    await mongoose.disconnect();
  } catch (_e) {
    // ignore
  }
  process.exit(1);
});
