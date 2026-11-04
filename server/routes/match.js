const express = require("express");
const { matchDonors, matchRequests } = require("../controllers/matchController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/donors", protect, matchDonors);
router.get("/requests", protect, requireRole("donor"), matchRequests);

module.exports = router;
