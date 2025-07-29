const express = require("express");
const router = express.Router();
const pool = require('../../db');


// GET   /api/rider/dashboard?rider_id=101
router.get("/dashboard", async (req, res) => {
    try {
        const rider_id = req.query.rider_id;

        const result = await pool.query(
            `
      SELECT 
        r.source,
        r.destination,
        r.vehicle,
        r.start_time,
        u.name AS driver_name
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.rider_id = $1 AND r.status = 'completed'
      ORDER BY r.start_time DESC
      LIMIT 1
      `,
            [rider_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No completed rides found for this rider." });
        }

        res.json({ last_ride: result.rows[0] });




    } catch (error) {
        console.error("Error fetching rider dashboard:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// GET  /api/rider/history?rider_id=101
router.get("/history", async (req, res) => {
    try {
        const rider_id = req.query.rider_id;

        const result = await pool.query(
            `
      SELECT 
        r.source,
        r.destination,
        r.fare,
        r.start_time,
        u.name AS driver_name,
        rt.rating,
        rt.comment
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      LEFT JOIN ratings rt ON r.ride_id = rt.ride_id AND rt.role = 'rider'
      WHERE r.rider_id = $1 AND r.status = 'completed'
      ORDER BY r.start_time DESC
      `,
            [rider_id]
        );

        res.json({ rides: result.rows });
    } catch (error) {
        console.error("Error fetching driver history:", error);
    }
});


// POST /api/rider/promo
router.post("/promo", async (req, res) => {
  const { rider_id, code, action } = req.body;

  if (!rider_id || !code || !action) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!['used', 'decline'].includes(action)) {
    return res.status(400).json({ error: "Invalid action. Must be 'used' or 'decline'" });
  }

  try {
    // Check if the promo exists and belongs to the rider
    const promoRes = await pool.query(
      "SELECT * FROM promo_codes WHERE rider_id = $1 AND code = $2 AND status = 'open'",
      [rider_id, code]
    );

    if (promoRes.rowCount === 0) {
      return res.status(404).json({ error: "Promo code not found or already used/closed" });
    }

    const newStatus = action === "used" ? "used" : "closed";

    // Update the promo code's status
    await pool.query(
      "UPDATE promo_codes SET status = $1 WHERE rider_id = $2 AND code = $3",
      [newStatus, rider_id, code]
    );

    res.json({ message: `Promo code ${action} successfully.` });
  } catch (error) {
    console.error("Error handling promo code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;