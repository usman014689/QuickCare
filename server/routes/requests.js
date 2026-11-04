const express = require("express");
const {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
} = require("../controllers/requestController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

function optionalProtect(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return next();
  }
  return protect(req, res, next);
}

router.get("/", listRequests);
router.get("/:id", optionalProtect, getRequest);
router.post("/", protect, requireRole("seeker"), createRequest);
router.patch("/:id", protect, patchRequest);

module.exports = router;
