async function searchGeo(req, res) {
  const q = String(req.query.q || "").trim();

  if (q.length < 2 || q.length > 200) {
    return res.status(400).json({
      message: "q must be 2 to 200 characters",
    });
  }

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "5");
  // Prefer results near Dublin while allowing international searches.
  url.searchParams.set("lat", "53.3498");
  url.searchParams.set("lon", "-6.2603");

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      return res.status(502).json({
        message: "Geocoding service unavailable",
      });
    }

    const { features } = await response.json();
    const results = features.slice(0, 5).map(({ geometry, properties }) => {
      const [longitude, latitude] = geometry.coordinates;
      const city =
        properties.city || properties.district || properties.county || "";
      const displayName = [
        ...new Set(
          [
            properties.name,
            properties.street,
            city,
            properties.state,
            properties.country,
          ].filter(Boolean)
        ),
      ].join(", ");

      return { displayName, latitude, longitude, city };
    });

    return res.json({ results });
  } catch {
    return res.status(502).json({
      message: "Geocoding service unavailable",
    });
  }
}

module.exports = { searchGeo };
