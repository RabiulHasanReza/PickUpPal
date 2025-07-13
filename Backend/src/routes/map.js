// routes/map.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// In-memory cache for geocoding results
const geocodeCache = new Map();

const geocode = async (address, retries = 3) => {
  const cacheKey = address.toLowerCase().trim();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "YourApp/1.0 (contact@yourdomain.com)",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    if (!response.data || response.data.length === 0) {
      throw new Error("Address not found");
    }

    const result = {
      lat: parseFloat(response.data[0].lat),
      lon: parseFloat(response.data[0].lon),
      display_name: response.data[0].display_name,
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return geocode(address, retries - 1);
    }
    throw new Error(`Geocoding failed: ${err.message}`);
  }
};

const getRoute = async (origin, destination) => {
  try {
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`,
      {
        params: {
          overview: "false",
          alternatives: "false",
          steps: "false",
        },
        timeout: 5000,
      }
    );

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error("No route found");
    }

    return response.data.routes[0];
  } catch (err) {
    throw new Error(`Routing failed: ${err.message}`);
  }
};

// Replace the entire geocode route with:
router.get("/geocode", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Missing query parameter "q"',
        results: [],
      });
    }

    const response = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q,
          key: "bd9098dfeea14d13ac1812e4eb8ffe51",
          limit: 5,
          language: "en",
          no_annotations: 1,
        },
        timeout: 10000,
      }
    );

    const results = response.data.results.map((item) => ({
      display_name: item.formatted, // Match frontend expectation
      lat: item.geometry.lat,
      lng: item.geometry.lng, // Use lng instead of lon
      place_id: item.annotations?.geohash || Date.now().toString(),
    }));

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      results: [],
    });
  }
});

router.get("/distance", async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        error: "Missing parameters",
        details: "Both origin and destination are required",
      });
    }

    const [originCoords, destCoords] = await Promise.all([
      geocode(origin),
      geocode(destination),
    ]);

    const route = await getRoute(originCoords, destCoords);

    res.json({
      distance: {
        meters: route.distance,
        kilometers: (route.distance / 1000).toFixed(2),
        miles: (route.distance / 1609.34).toFixed(2),
      },
      duration: {
        seconds: route.duration,
        minutes: (route.duration / 60).toFixed(1),
        hours: (route.duration / 3600).toFixed(2),
      },
      coordinates: {
        origin: { ...originCoords, query: origin },
        destination: { ...destCoords, query: destination },
      },
    });
  } catch (err) {
    const statusCode = err.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      error: "Route calculation failed",
      details: err.message,
    });
  }
});

module.exports = router;
