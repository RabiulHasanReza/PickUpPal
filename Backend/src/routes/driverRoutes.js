const express = require("express");
const router = express.Router();
const pool = require('../models/db');


// GET   /api/driver/dashboard?driver_id=101
router.get("/dashboard", async (req, res) => {
  try {
    const driver_id = req.query.driver_id;

    const result = await pool.query(
      `
      SELECT
        -- 1. Today's income
        SUM(CASE WHEN start_time::date = CURRENT_DATE AND status = 'completed' THEN fare ELSE 0 END) AS today_income,

        -- 2. This week's income
        SUM(CASE WHEN date_trunc('week', start_time) = date_trunc('week', CURRENT_DATE) AND status = 'completed' THEN fare ELSE 0 END) AS week_income,

        -- 3. This month's income
        SUM(CASE WHEN date_trunc('month', start_time) = date_trunc('month', CURRENT_DATE) AND status = 'completed' THEN fare ELSE 0 END) AS month_income,

        -- 4. Total completed rides
        COUNT(*) FILTER (WHERE status = 'completed') AS total_completed_rides

      FROM rides
      WHERE driver_id = $1
      `,
      [driver_id]
    );

    const stats = result.rows[0];

    // Get avg rating from user_history
    const ratingResult = await pool.query(
      `SELECT avg_rating FROM user_history WHERE user_id = $1 AND role = 'driver'`,
      [driver_id]
    );

    const avgRating = ratingResult.rows[0]?.avg_rating || 0;

    res.json({
      today_income: parseFloat(stats.today_income || 0),
      week_income: parseFloat(stats.week_income || 0),
      month_income: parseFloat(stats.month_income || 0),
      total_completed_rides: parseInt(stats.total_completed_rides || 0),
      avg_rating: parseFloat(avgRating),
    });
  } catch (error) {
    console.error("Error fetching driver dashboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET   /api/driver/earnings?driver_id=101
router.get("/earnings", async (req, res) => {
  try {
    const driver_id = req.query.driver_id;

    const result = await pool.query(
      `
      SELECT
        -- 1. Today's income
        SUM(CASE WHEN start_time::date = CURRENT_DATE AND status = 'completed' THEN fare ELSE 0 END) AS today_income,

        -- 2. This week's income
        SUM(CASE WHEN date_trunc('week', start_time) = date_trunc('week', CURRENT_DATE) AND status = 'completed' THEN fare ELSE 0 END) AS week_income,

        -- 3. This month's income
        SUM(CASE WHEN date_trunc('month', start_time) = date_trunc('month', CURRENT_DATE) AND status = 'completed' THEN fare ELSE 0 END) AS month_income,

        -- 4. Total income 
        SUM(CASE WHEN status = 'completed' THEN fare ELSE 0 END) AS total_income

      FROM rides
      WHERE driver_id = $1
      `,
      [driver_id]
    );

    const stats = result.rows[0];

  //   const lastRideResult = await pool.query(
  //     `
  // SELECT r.source, r.destination, r.fare, r.start_time
  // FROM rides r
  // WHERE r.driver_id = $1 AND r.status = 'completed'
  // ORDER BY r.end_time DESC
  // LIMIT 1
  // `,
  //     [driver_id]
  //   );

    // const lastRide = lastRideResult.rows[0] || null;

    res.json({
      today_income: parseFloat(stats.today_income || 0),
      week_income: parseFloat(stats.week_income || 0),
      month_income: parseFloat(stats.month_income || 0),
      total_income: parseInt(stats.total_income || 0),
      // last_ride: lastRide
    });
  } catch (error) {
    console.error("Error fetching driver earnings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET  /api/driver/history?driver_id=101
router.get("/history", async (req, res) => {
  try {
     const driver_id = req.query.driver_id;

    const result = await pool.query(
      `
      SELECT 
        r.source,
        r.destination,
        r.fare,
        r.start_time,
        u.name AS rider_name,
        rt.rating,
        rt.comment
      FROM rides r
      JOIN users u ON r.rider_id = u.id
      LEFT JOIN ratings rt ON r.ride_id = rt.ride_id AND rt.role = 'driver'
      WHERE r.driver_id = $1 AND r.status = 'completed'
      ORDER BY r.start_time DESC
      `,
      [driver_id]
    );

    res.json({ rides: result.rows });
  } catch (error) {
    console.error("Error fetching driver history:", error);
  }
});

// PUT  /api/driver/settings
router.put("/settings", async (req, res) => {
   const client = await pool.connect();            // For transaction management
   // Transaction is important to ensure both user and vehicle updates succeed or fail together. To ensure data consistency. If one update fails, both get rolled back.
  try {
    const { driver_id, name, email, phone, vehicle } = req.body;

    await client.query('BEGIN');

    // Update users table
    await client.query(
      `
      UPDATE users
      SET name = $1, email = $2, phone = $3
      WHERE id = $4 AND role = 'driver'
      `,
      [name, email, phone, driver_id]
    );

    // Update vehicles table
    await client.query(
      `
      UPDATE vehicles
      SET model = $1,
          license_plate = $2,
          capacity = $3,
          color = $4
      WHERE driver_id = $5
      `,
      [
        vehicle.model,
        vehicle.license_plate,
        vehicle.capacity,
        vehicle.color,
        driver_id,
      ]
    );

    await client.query('COMMIT');
    res.json({ message: "Driver profile and vehicle updated successfully." });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error("Error updating driver profile:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});


//GET /api/driver/settings?driver_id=101
router.get("/settings", async (req, res) => {
  try {
    const driver_id = req.query.driver_id;

    const result = await pool.query(
      `
      SELECT 
        u.name,
        u.email,
        u.phone,
        v.model,
        v.license_plate,
        v.capacity,
        v.color
      FROM users u
      LEFT JOIN vehicles v ON u.id = v.driver_id
      WHERE u.id = $1 AND u.role = 'driver'
      `,
      [driver_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const row = result.rows[0];

    const profile = {
      name: row.name,
      email: row.email,
      phone: row.phone,
      vehicle: {
        model: row.model,
        license_plate: row.license_plate,
        capacity: row.capacity,
        color: row.color
      }
    };

    res.json({ profile });

  } catch (error) {
    console.error("Error fetching driver profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;