const express = require("express");
const {
  overview,
  listDonors,
  listRequests,
  deactivateDonor,
  cancelRequest,
} = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/overview", overview);
router.get("/donors", listDonors);
router.get("/requests", listRequests);
router.patch("/donors/:id/deactivate", deactivateDonor);
router.patch("/requests/:id/cancel", cancelRequest);

module.exports = router;
