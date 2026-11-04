const express = require("express");
const {
  listDonors,
  getDonor,
  getMyDonor,
  createDonor,
  updateDonor,
  patchAvailability,
} = require("../controllers/donorController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

function optionalProtect(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return next();
  }
  return protect(req, res, next);
}

router.get("/", listDonors);
router.get("/me", protect, requireRole("donor"), getMyDonor);
router.get("/:id", optionalProtect, getDonor);
router.post("/", protect, requireRole("donor"), createDonor);
router.put("/:id", protect, updateDonor);
router.patch("/:id/availability", protect, patchAvailability);

module.exports = router;
