const { BLOOD_GROUPS } = require("../models/DonorProfile");

function normalizeBloodGroup(value) {
  if (value === undefined || value === null) return null;

  const raw = String(value);
  const candidates = [
    raw.trim().toUpperCase(),
    raw.replace(/ /g, "+").trim().toUpperCase(),
  ];

  for (const candidate of candidates) {
    if (BLOOD_GROUPS.includes(candidate)) {
      return candidate;
    }
  }

  // Query strings turn "O+" into "O " → trim → "O". Prefer the + form.
  const bare = raw.trim().toUpperCase();
  if (/^(A|B|AB|O)$/.test(bare) && BLOOD_GROUPS.includes(`${bare}+`)) {
    return `${bare}+`;
  }

  return null;
}

module.exports = {
  normalizeBloodGroup,
  BLOOD_GROUPS,
};
