const mongoose = require("mongoose");
const { BLOOD_GROUPS } = require("./DonorProfile");

const URGENCY_LEVELS = ["normal", "urgent", "critical"];
const REQUEST_STATUSES = ["open", "fulfilled", "cancelled"];

const bloodRequestSchema = new mongoose.Schema(
  {
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    unitsNeeded: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    locationText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    urgency: {
      type: String,
      enum: URGENCY_LEVELS,
      default: "normal",
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
module.exports.URGENCY_LEVELS = URGENCY_LEVELS;
module.exports.REQUEST_STATUSES = REQUEST_STATUSES;
