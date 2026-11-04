const { BLOOD_GROUPS } = require("./bloodGroup");

// Recipient needed group → donor groups that can safely give blood.
// Simple clinical matching rules; document assumptions in the report.
const DONOR_GROUPS_FOR_RECIPIENT = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

function getCompatibleDonorGroups(neededGroup) {
  return DONOR_GROUPS_FOR_RECIPIENT[neededGroup] || [];
}

function canDonateTo(donorGroup, neededGroup) {
  return getCompatibleDonorGroups(neededGroup).includes(donorGroup);
}

function getRequestsCompatibleWithDonor(donorGroup) {
  return BLOOD_GROUPS.filter((needed) => canDonateTo(donorGroup, needed));
}

module.exports = {
  DONOR_GROUPS_FOR_RECIPIENT,
  getCompatibleDonorGroups,
  canDonateTo,
  getRequestsCompatibleWithDonor,
};
