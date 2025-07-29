const express = require("express");
const router = express.Router();
const pool = require('../../db');


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

// Reza


// const pool = require("../../db");

// // Create ride request
// router.post("/request", async (req, res) => {
//   try {
//     const { rider_id, pickup, destination } = req.body;

//     if (!rider_id || !pickup || !destination) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Verify rider exists
//     const rider = await pool.query("SELECT * FROM riders WHERE rider_id = $1", [
//       rider_id,
//     ]);

//     if (rider.rows.length === 0) {
//       return res.status(404).json({ error: "Rider not found" });
//     }

//     // Create ride request in ride_req table
//     const newRequest = await pool.query(
//       `INSERT INTO ride_req (rider_id, req_time) 
//        VALUES ($1, CURRENT_TIMESTAMP) 
//        RETURNING *`,
//       [rider_id]
//     );

//     // Also create entry in rides table
//     await pool.query(
//       `INSERT INTO rides (ride_id, rider_id) 
//        VALUES ($1, $2)`,
//       [newRequest.rows[0].ride_id, rider_id]
//     );

//     res.status(201).json({
//       ...newRequest.rows[0],
//       pickup,
//       destination,
//       status: "pending",
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: "Server error creating ride request" });
//   }
// });

// // Get all rides
// router.get("/", async (req, res) => {
//   try {
//     const { rider_id, driver_id, status } = req.query;

//     let query = `
//       SELECT r.ride_id, r.rider_id, r.driver_id, 
//              rr.req_time, rr.res_time, rr.arrived_time,
//              u1.name as rider_name, u2.name as driver_name,
//              v.model as vehicle_model, v.license_plate
//       FROM rides r
//       JOIN ride_req rr ON r.ride_id = rr.ride_id
//       JOIN riders rd ON r.rider_id = rd.rider_id
//       JOIN users u1 ON rd.rider_id = u1.id
//       LEFT JOIN drivers d ON r.driver_id = d.driver_id
//       LEFT JOIN users u2 ON d.driver_id = u2.id
//       LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id
//       WHERE 1=1
//     `;

//     const params = [];
//     let paramCount = 1;

//     if (rider_id) {
//       query += ` AND r.rider_id = $${paramCount++}`;
//       params.push(rider_id);
//     }

//     if (driver_id) {
//       query += ` AND r.driver_id = $${paramCount++}`;
//       params.push(driver_id);
//     }

//     query += " ORDER BY rr.req_time DESC";

//     const result = await pool.query(query, params);
//     res.json(result.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: "Server error fetching rides" });
//   }
// });

// // Driver accepts ride request
// router.post("/:id/accept", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { driver_id, vehicle_id } = req.body;

//     if (!driver_id || !vehicle_id) {
//       return res
//         .status(400)
//         .json({ error: "Driver ID and Vehicle ID are required" });
//     }

//     // Verify driver and vehicle exist
//     const driver = await pool.query(
//       "SELECT * FROM drivers WHERE driver_id = $1",
//       [driver_id]
//     );

//     if (driver.rows.length === 0) {
//       return res.status(404).json({ error: "Driver not found" });
//     }

//     const vehicle = await pool.query(
//       "SELECT * FROM vehicles WHERE vehicle_id = $1 AND driver_id = $2",
//       [vehicle_id, driver_id]
//     );

//     if (vehicle.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "Vehicle not found or not owned by driver" });
//     }

//     // Update ride request in both tables
//     await pool.query("BEGIN");

//     // Update ride_req table
//     const updatedReq = await pool.query(
//       `UPDATE ride_req 
//        SET driver_id = $1, res_time = CURRENT_TIMESTAMP 
//        WHERE ride_id = $2 
//        RETURNING *`,
//       [driver_id, id]
//     );

//     // Update rides table
//     const updatedRide = await pool.query(
//       `UPDATE rides 
//        SET driver_id = $1, vehicle_id = $2 
//        WHERE ride_id = $3 
//        RETURNING *`,
//       [driver_id, vehicle_id, id]
//     );

//     await pool.query("COMMIT");

//     if (updatedReq.rows.length === 0 || updatedRide.rows.length === 0) {
//       return res.status(404).json({ error: "Ride not found" });
//     }

//     res.json({
//       ...updatedReq.rows[0],
//       ...updatedRide.rows[0],
//     });
//   } catch (error) {
//     await pool.query("ROLLBACK");
//     console.error(error.message);
//     res.status(500).json({ error: "Server error accepting ride" });
//   }
// });

// // Complete ride
// router.post("/:id/complete", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { fare } = req.body;

//     // Update ride status
//     const updatedRide = await pool.query(
//       `UPDATE ride_req 
//        SET arrived_time = CURRENT_TIMESTAMP 
//        WHERE ride_id = $1 
//        RETURNING *`,
//       [id]
//     );

//     if (updatedRide.rows.length === 0) {
//       return res.status(404).json({ error: "Ride not found" });
//     }

//     res.json(updatedRide.rows[0]);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: "Server error completing ride" });
//   }
// });

// module.exports = router;