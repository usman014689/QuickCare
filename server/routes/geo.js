const express = require("express");
const { searchGeo } = require("../controllers/geoController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Authenticated proxy so anonymous clients cannot hammer Nominatim through us
router.get("/search", protect, searchGeo);

module.exports = router;
