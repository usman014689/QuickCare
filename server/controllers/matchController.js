const { DonorProfile, BloodRequest } = require("../models");
const { normalizeBloodGroup } = require("../utils/bloodGroup");
const {
  getCompatibleDonorGroups,
  getRequestsCompatibleWithDonor,
} = require("../utils/bloodCompatibility");

async function matchDonors(req, res) {
  try {
    const neededGroup = normalizeBloodGroup(req.query.bloodGroup);
    if (!neededGroup) {
      return res.status(400).json({ message: "Valid bloodGroup query is required" });
    }

    const compatibleGroups = getCompatibleDonorGroups(neededGroup);
    const filter = {
      bloodGroup: { $in: compatibleGroups },
      isAvailable: true,
    };

    if (req.query.city) {
      filter.city = new RegExp(String(req.query.city).trim(), "i");
    }

    const donors = await DonorProfile.find(filter)
      .populate("user", "name role")
      .sort({ updatedAt: -1 });

    return res.json({
      neededGroup,
      compatibleDonorGroups: compatibleGroups,
      donors: donors.map((profile) => ({
        id: profile._id,
        bloodGroup: profile.bloodGroup,
        isAvailable: profile.isAvailable,
        city: profile.city,
        addressText: profile.addressText,
        user: profile.user
          ? { id: profile.user._id, name: profile.user.name, role: profile.user.role }
          : profile.user,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Donor match failed", detail: error.message });
  }
}

async function matchRequests(req, res) {
  try {
    const profile = await DonorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        message: "Create a donor profile before matching open requests",
      });
    }

    const neededGroups = getRequestsCompatibleWithDonor(profile.bloodGroup);

    const requests = await BloodRequest.find({
      status: "open",
      bloodGroup: { $in: neededGroups },
    })
      .populate("seeker", "name role")
      .sort({ urgency: -1, createdAt: -1 });

    return res.json({
      donorBloodGroup: profile.bloodGroup,
      matchingNeededGroups: neededGroups,
      requests: requests.map((doc) => ({
        id: doc._id,
        bloodGroup: doc.bloodGroup,
        unitsNeeded: doc.unitsNeeded,
        hospitalName: doc.hospitalName,
        locationText: doc.locationText,
        urgency: doc.urgency,
        status: doc.status,
        seeker: doc.seeker
          ? { id: doc.seeker._id, name: doc.seeker.name, role: doc.seeker.role }
          : doc.seeker,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Request match failed", detail: error.message });
  }
}

module.exports = {
  matchDonors,
  matchRequests,
};
