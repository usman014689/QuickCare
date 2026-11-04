async function searchGeo(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) {
      return res.status(400).json({ message: "q must be at least 2 characters" });
    }

    if (q.length > 200) {
      return res.status(400).json({ message: "q is too long" });
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "5");

    const response = await fetch(url, {
      headers: {
        // Nominatim usage policy requires a valid identifying User-Agent
        "User-Agent": "QuickCare/1.0 (B9IS130 coursework; contact: usman014689@gmail.com)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Geocoding service unavailable" });
    }

    const results = await response.json();
    return res.json({
      results: (results || []).map((item) => ({
        displayName: item.display_name,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        city:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.state ||
          "",
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Geocoding failed", detail: error.message });
  }
}

module.exports = {
  searchGeo,
};
