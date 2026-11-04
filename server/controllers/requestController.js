const { BloodRequest } = require("../models");
const { normalizeBloodGroup } = require("../utils/bloodGroup");
const {
  URGENCY_LEVELS,
  REQUEST_STATUSES,
} = require("../models/BloodRequest");

function shapeRequest(doc, { includeContact = false } = {}) {
  const seeker = doc.seeker && typeof doc.seeker === "object" ? doc.seeker : null;

  return {
    id: doc._id,
    bloodGroup: doc.bloodGroup,
    unitsNeeded: doc.unitsNeeded,
    hospitalName: doc.hospitalName,
    locationText: doc.locationText,
    latitude: doc.latitude,
    longitude: doc.longitude,
    urgency: doc.urgency,
    status: doc.status,
    seeker: seeker
      ? {
          id: seeker._id,
          name: seeker.name,
          role: seeker.role,
          ...(includeContact
            ? { email: seeker.email, phone: seeker.phone }
            : {}),
        }
      : doc.seeker,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function listRequests(req, res) {
  try {
    const filter = {};

    if (req.query.bloodGroup) {
      const bloodGroup = normalizeBloodGroup(req.query.bloodGroup);
      if (!bloodGroup) {
        return res.status(400).json({ message: "Invalid bloodGroup filter" });
      }
      filter.bloodGroup = bloodGroup;
    }

    if (req.query.status) {
      if (!REQUEST_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      filter.status = req.query.status;
    } else {
      filter.status = "open";
    }

    if (req.query.urgency) {
      if (!URGENCY_LEVELS.includes(req.query.urgency)) {
        return res.status(400).json({ message: "Invalid urgency filter" });
      }
      filter.urgency = req.query.urgency;
    }

    const requests = await BloodRequest.find(filter)
      .populate("seeker", "name role")
      .sort({ createdAt: -1 });

    return res.json({
      requests: requests.map((r) => shapeRequest(r, { includeContact: false })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list requests", detail: error.message });
  }
}

async function getRequest(req, res) {
  try {
    const doc = await BloodRequest.findById(req.params.id).populate(
      "seeker",
      "name role email phone"
    );

    if (!doc) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    return res.json({
      request: shapeRequest(doc, { includeContact: Boolean(req.user) }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get request", detail: error.message });
  }
}

async function createRequest(req, res) {
  try {
    const {
      bloodGroup,
      unitsNeeded,
      hospitalName,
      locationText,
      urgency,
      latitude,
      longitude,
    } = req.body;

    if (!bloodGroup || !unitsNeeded || !hospitalName || !locationText) {
      return res.status(400).json({
        message: "bloodGroup, unitsNeeded, hospitalName, and locationText are required",
      });
    }

    const normalizedGroup = normalizeBloodGroup(bloodGroup);
    if (!normalizedGroup) {
      return res.status(400).json({ message: "Invalid bloodGroup" });
    }

    const units = Number(unitsNeeded);
    if (!Number.isFinite(units) || units < 1) {
      return res.status(400).json({ message: "unitsNeeded must be a positive number" });
    }

    if (urgency && !URGENCY_LEVELS.includes(urgency)) {
      return res.status(400).json({ message: "Invalid urgency" });
    }

    const doc = await BloodRequest.create({
      seeker: req.user._id,
      bloodGroup: normalizedGroup,
      unitsNeeded: units,
      hospitalName: String(hospitalName).trim(),
      locationText: String(locationText).trim(),
      urgency: urgency || "normal",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    });

    await doc.populate("seeker", "name role email phone");

    return res.status(201).json({
      request: shapeRequest(doc, { includeContact: true }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create request", detail: error.message });
  }
}

async function patchRequest(req, res) {
  try {
    const doc = await BloodRequest.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    const isOwner = String(doc.seeker) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Only the owner or admin can update this request" });
    }

    if (req.body.status !== undefined) {
      if (!REQUEST_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      doc.status = req.body.status;
    }

    if (req.body.urgency !== undefined) {
      if (!URGENCY_LEVELS.includes(req.body.urgency)) {
        return res.status(400).json({ message: "Invalid urgency" });
      }
      doc.urgency = req.body.urgency;
    }

    if (req.body.unitsNeeded !== undefined) {
      const units = Number(req.body.unitsNeeded);
      if (!Number.isFinite(units) || units < 1) {
        return res.status(400).json({ message: "unitsNeeded must be a positive number" });
      }
      doc.unitsNeeded = units;
    }

    if (req.body.hospitalName !== undefined) {
      doc.hospitalName = String(req.body.hospitalName).trim();
    }

    if (req.body.locationText !== undefined) {
      doc.locationText = String(req.body.locationText).trim();
    }

    await doc.save();
    await doc.populate("seeker", "name role email phone");

    return res.json({
      request: shapeRequest(doc, { includeContact: true }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update request", detail: error.message });
  }
}

module.exports = {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
};
