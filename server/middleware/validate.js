const { normalizeBloodGroup } = require("../utils/bloodGroup");
const { URGENCY_LEVELS, REQUEST_STATUSES } = require("../models/BloodRequest");

function isNonEmptyString(value, max = 200) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateRegister(req, res, next) {
  const { name, email, password, role, phone } = req.body || {};
  const errors = [];

  if (!isNonEmptyString(name, 100)) errors.push("name is required (max 100 chars)");
  if (!isEmail(email)) errors.push("valid email is required");
  if (typeof password !== "string" || password.length < 6 || password.length > 100) {
    errors.push("password must be 6-100 characters");
  }
  if (!["donor", "seeker"].includes(role)) errors.push("role must be donor or seeker");
  if (phone !== undefined && phone !== null && String(phone).length > 30) {
    errors.push("phone is too long");
  }

  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];
  if (!isEmail(email)) errors.push("valid email is required");
  if (typeof password !== "string" || !password) errors.push("password is required");
  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }
  next();
}

function validateDonorBody(req, res, next) {
  const body = req.body || {};
  const errors = [];

  if (body.bloodGroup !== undefined) {
    const group = normalizeBloodGroup(body.bloodGroup);
    if (!group) errors.push("invalid bloodGroup");
    else req.body.bloodGroup = group;
  }

  if (req.method === "POST") {
    if (!body.bloodGroup) errors.push("bloodGroup is required");
    if (!isNonEmptyString(body.city, 100)) errors.push("city is required (max 100 chars)");
  }

  if (body.city !== undefined && !isNonEmptyString(body.city, 100)) {
    errors.push("city must be 1-100 characters");
  }
  if (body.addressText !== undefined && String(body.addressText).length > 250) {
    errors.push("addressText max 250 characters");
  }
  if (body.notes !== undefined && String(body.notes).length > 500) {
    errors.push("notes max 500 characters");
  }
  if (body.isAvailable !== undefined && typeof body.isAvailable !== "boolean") {
    errors.push("isAvailable must be boolean");
  }
  if (body.latitude !== undefined && body.latitude !== null && !Number.isFinite(Number(body.latitude))) {
    errors.push("latitude must be a number");
  }
  if (body.longitude !== undefined && body.longitude !== null && !Number.isFinite(Number(body.longitude))) {
    errors.push("longitude must be a number");
  }

  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }
  next();
}

function validateRequestBody(req, res, next) {
  const body = req.body || {};
  const errors = [];

  if (req.method === "POST") {
    if (!normalizeBloodGroup(body.bloodGroup)) errors.push("valid bloodGroup is required");
    if (!Number.isFinite(Number(body.unitsNeeded)) || Number(body.unitsNeeded) < 1) {
      errors.push("unitsNeeded must be a positive number");
    }
    if (!isNonEmptyString(body.hospitalName, 150)) errors.push("hospitalName is required");
    if (!isNonEmptyString(body.locationText, 250)) errors.push("locationText is required");
  }

  if (body.bloodGroup !== undefined) {
    const group = normalizeBloodGroup(body.bloodGroup);
    if (!group) errors.push("invalid bloodGroup");
    else req.body.bloodGroup = group;
  }
  if (body.urgency !== undefined && !URGENCY_LEVELS.includes(body.urgency)) {
    errors.push("invalid urgency");
  }
  if (body.status !== undefined && !REQUEST_STATUSES.includes(body.status)) {
    errors.push("invalid status");
  }
  if (body.unitsNeeded !== undefined) {
    const units = Number(body.unitsNeeded);
    if (!Number.isFinite(units) || units < 1 || units > 20) {
      errors.push("unitsNeeded must be 1-20");
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateDonorBody,
  validateRequestBody,
};
