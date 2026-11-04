const { User, DonorProfile, BloodRequest } = require("../models");

async function overview(_req, res) {
  try {
    const [users, donors, openRequests, fulfilledRequests, cancelledRequests] =
      await Promise.all([
        User.countDocuments(),
        DonorProfile.countDocuments(),
        BloodRequest.countDocuments({ status: "open" }),
        BloodRequest.countDocuments({ status: "fulfilled" }),
        BloodRequest.countDocuments({ status: "cancelled" }),
      ]);

    const byRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    return res.json({
      users,
      donors,
      requests: {
        open: openRequests,
        fulfilled: fulfilledRequests,
        cancelled: cancelledRequests,
      },
      roles: byRole.reduce((acc, row) => {
        acc[row._id] = row.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load admin overview", detail: error.message });
  }
}

async function listDonors(_req, res) {
  try {
    const donors = await DonorProfile.find()
      .populate("user", "name email phone role")
      .sort({ updatedAt: -1 });

    return res.json({
      donors: donors.map((d) => ({
        id: d._id,
        bloodGroup: d.bloodGroup,
        isAvailable: d.isAvailable,
        city: d.city,
        addressText: d.addressText,
        user: d.user
          ? {
              id: d.user._id,
              name: d.user.name,
              email: d.user.email,
              phone: d.user.phone,
              role: d.user.role,
            }
          : null,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list donors", detail: error.message });
  }
}

async function listRequests(_req, res) {
  try {
    const requests = await BloodRequest.find()
      .populate("seeker", "name email phone role")
      .sort({ createdAt: -1 });

    return res.json({
      requests: requests.map((r) => ({
        id: r._id,
        bloodGroup: r.bloodGroup,
        unitsNeeded: r.unitsNeeded,
        hospitalName: r.hospitalName,
        locationText: r.locationText,
        urgency: r.urgency,
        status: r.status,
        seeker: r.seeker
          ? {
              id: r.seeker._id,
              name: r.seeker.name,
              email: r.seeker.email,
              phone: r.seeker.phone,
            }
          : null,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list requests", detail: error.message });
  }
}

async function deactivateDonor(req, res) {
  try {
    const donor = await DonorProfile.findById(req.params.id).populate(
      "user",
      "name email phone role"
    );
    if (!donor) {
      return res.status(404).json({ message: "Donor profile not found" });
    }

    donor.isAvailable = false;
    await donor.save();

    return res.json({
      message: "Donor marked unavailable",
      donor: {
        id: donor._id,
        isAvailable: donor.isAvailable,
        bloodGroup: donor.bloodGroup,
        city: donor.city,
        user: donor.user
          ? {
              id: donor.user._id,
              name: donor.user.name,
              email: donor.user.email,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to deactivate donor", detail: error.message });
  }
}

async function cancelRequest(req, res) {
  try {
    const doc = await BloodRequest.findById(req.params.id).populate(
      "seeker",
      "name email phone"
    );
    if (!doc) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    doc.status = "cancelled";
    await doc.save();

    return res.json({
      message: "Request cancelled",
      request: {
        id: doc._id,
        status: doc.status,
        bloodGroup: doc.bloodGroup,
        hospitalName: doc.hospitalName,
        seeker: doc.seeker
          ? {
              id: doc.seeker._id,
              name: doc.seeker.name,
              email: doc.seeker.email,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to cancel request", detail: error.message });
  }
}

module.exports = {
  overview,
  listDonors,
  listRequests,
  deactivateDonor,
  cancelRequest,
};
