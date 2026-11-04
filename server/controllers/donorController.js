const { DonorProfile } = require("../models");
const { normalizeBloodGroup } = require("../utils/bloodGroup");

function shapeDonor(profile, { includeContact = false } = {}) {
  const user = profile.user && typeof profile.user === "object" ? profile.user : null;

  const base = {
    id: profile._id,
    bloodGroup: profile.bloodGroup,
    isAvailable: profile.isAvailable,
    city: profile.city,
    addressText: profile.addressText,
    latitude: profile.latitude,
    longitude: profile.longitude,
    lastDonationDate: profile.lastDonationDate,
    notes: profile.notes,
    user: user
      ? {
          id: user._id,
          name: user.name,
          role: user.role,
          ...(includeContact
            ? { email: user.email, phone: user.phone }
            : {}),
        }
      : profile.user,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };

  return base;
}

async function listDonors(req, res) {
  try {
    const filter = {};

    if (req.query.bloodGroup) {
      const bloodGroup = normalizeBloodGroup(req.query.bloodGroup);
      if (!bloodGroup) {
        return res.status(400).json({ message: "Invalid bloodGroup filter" });
      }
      filter.bloodGroup = bloodGroup;
    }

    if (req.query.city) {
      filter.city = new RegExp(String(req.query.city).trim(), "i");
    }

    if (req.query.available === "true") {
      filter.isAvailable = true;
    } else if (req.query.available === "false") {
      filter.isAvailable = false;
    }

    const donors = await DonorProfile.find(filter)
      .populate("user", "name role")
      .sort({ updatedAt: -1 });

    return res.json({
      donors: donors.map((d) => shapeDonor(d, { includeContact: false })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list donors", detail: error.message });
  }
}

async function getDonor(req, res) {
  try {
    const donor = await DonorProfile.findById(req.params.id).populate(
      "user",
      "name role email phone"
    );

    if (!donor) {
      return res.status(404).json({ message: "Donor profile not found" });
    }

    const includeContact = Boolean(req.user);
    return res.json({
      donor: shapeDonor(donor, { includeContact }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get donor", detail: error.message });
  }
}

async function createDonor(req, res) {
  try {
    const existing = await DonorProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "Donor profile already exists for this user" });
    }

    const { bloodGroup, city, addressText, isAvailable, latitude, longitude, lastDonationDate, notes } =
      req.body;

    if (!bloodGroup || !city) {
      return res.status(400).json({ message: "bloodGroup and city are required" });
    }

    const normalizedGroup = normalizeBloodGroup(bloodGroup);
    if (!normalizedGroup) {
      return res.status(400).json({ message: "Invalid bloodGroup" });
    }

    const profile = await DonorProfile.create({
      user: req.user._id,
      bloodGroup: normalizedGroup,
      city: String(city).trim(),
      addressText: addressText ? String(addressText).trim() : "",
      isAvailable: typeof isAvailable === "boolean" ? isAvailable : true,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      lastDonationDate: lastDonationDate || null,
      notes: notes ? String(notes).trim() : "",
    });

    await profile.populate("user", "name role email phone");

    return res.status(201).json({
      donor: shapeDonor(profile, { includeContact: true }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create donor profile", detail: error.message });
  }
}

async function updateDonor(req, res) {
  try {
    const donor = await DonorProfile.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor profile not found" });
    }

    const isOwner = String(donor.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Only the owner or admin can update this profile" });
    }

    const allowed = [
      "bloodGroup",
      "city",
      "addressText",
      "isAvailable",
      "latitude",
      "longitude",
      "lastDonationDate",
      "notes",
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === "bloodGroup") {
          const normalizedGroup = normalizeBloodGroup(req.body.bloodGroup);
          if (!normalizedGroup) {
            return res.status(400).json({ message: "Invalid bloodGroup" });
          }
          donor.bloodGroup = normalizedGroup;
          continue;
        }
        donor[key] = req.body[key];
      }
    }

    await donor.save();
    await donor.populate("user", "name role email phone");

    return res.json({
      donor: shapeDonor(donor, { includeContact: true }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update donor profile", detail: error.message });
  }
}

async function patchAvailability(req, res) {
  try {
    const donor = await DonorProfile.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor profile not found" });
    }

    const isOwner = String(donor.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Only the owner or admin can change availability" });
    }

    if (typeof req.body.isAvailable !== "boolean") {
      return res.status(400).json({ message: "isAvailable boolean is required" });
    }

    donor.isAvailable = req.body.isAvailable;
    await donor.save();
    await donor.populate("user", "name role email phone");

    return res.json({
      donor: shapeDonor(donor, { includeContact: true }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update availability", detail: error.message });
  }
}

module.exports = {
  listDonors,
  getDonor,
  createDonor,
  updateDonor,
  patchAvailability,
};
