const express = require("express");
const router = express.Router();
const pool = require("../../db");

// Create ride request
router.post("/request", async (req, res) => {
  try {
    const { rider_id, pickup, destination } = req.body;

    if (!rider_id || !pickup || !destination) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify rider exists
    const rider = await pool.query("SELECT * FROM riders WHERE rider_id = $1", [
      rider_id,
    ]);

    if (rider.rows.length === 0) {
      return res.status(404).json({ error: "Rider not found" });
    }

    // Create ride request in ride_req table
    const newRequest = await pool.query(
      `INSERT INTO ride_req (rider_id, req_time) 
       VALUES ($1, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [rider_id]
    );

    // Also create entry in rides table
    await pool.query(
      `INSERT INTO rides (ride_id, rider_id) 
       VALUES ($1, $2)`,
      [newRequest.rows[0].ride_id, rider_id]
    );

    res.status(201).json({
      ...newRequest.rows[0],
      pickup,
      destination,
      status: "pending",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error creating ride request" });
  }
});

// Get all rides
router.get("/", async (req, res) => {
  try {
    const { rider_id, driver_id, status } = req.query;

    let query = `
      SELECT r.ride_id, r.rider_id, r.driver_id, 
             rr.req_time, rr.res_time, rr.arrived_time,
             u1.name as rider_name, u2.name as driver_name,
             v.model as vehicle_model, v.license_plate
      FROM rides r
      JOIN ride_req rr ON r.ride_id = rr.ride_id
      JOIN riders rd ON r.rider_id = rd.rider_id
      JOIN users u1 ON rd.rider_id = u1.id
      LEFT JOIN drivers d ON r.driver_id = d.driver_id
      LEFT JOIN users u2 ON d.driver_id = u2.id
      LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (rider_id) {
      query += ` AND r.rider_id = $${paramCount++}`;
      params.push(rider_id);
    }

    if (driver_id) {
      query += ` AND r.driver_id = $${paramCount++}`;
      params.push(driver_id);
    }

    query += " ORDER BY rr.req_time DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error fetching rides" });
  }
});

// Driver accepts ride request
router.post("/:id/accept", async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id, vehicle_id } = req.body;

    if (!driver_id || !vehicle_id) {
      return res
        .status(400)
        .json({ error: "Driver ID and Vehicle ID are required" });
    }

    // Verify driver and vehicle exist
    const driver = await pool.query(
      "SELECT * FROM drivers WHERE driver_id = $1",
      [driver_id]
    );

    if (driver.rows.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    const vehicle = await pool.query(
      "SELECT * FROM vehicles WHERE vehicle_id = $1 AND driver_id = $2",
      [vehicle_id, driver_id]
    );

    if (vehicle.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Vehicle not found or not owned by driver" });
    }

    // Update ride request in both tables
    await pool.query("BEGIN");

    // Update ride_req table
    const updatedReq = await pool.query(
      `UPDATE ride_req 
       SET driver_id = $1, res_time = CURRENT_TIMESTAMP 
       WHERE ride_id = $2 
       RETURNING *`,
      [driver_id, id]
    );

    // Update rides table
    const updatedRide = await pool.query(
      `UPDATE rides 
       SET driver_id = $1, vehicle_id = $2 
       WHERE ride_id = $3 
       RETURNING *`,
      [driver_id, vehicle_id, id]
    );

    await pool.query("COMMIT");

    if (updatedReq.rows.length === 0 || updatedRide.rows.length === 0) {
      return res.status(404).json({ error: "Ride not found" });
    }

    res.json({
      ...updatedReq.rows[0],
      ...updatedRide.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error.message);
    res.status(500).json({ error: "Server error accepting ride" });
  }
});

// Complete ride
router.post("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const { fare } = req.body;

    // Update ride status
    const updatedRide = await pool.query(
      `UPDATE ride_req 
       SET arrived_time = CURRENT_TIMESTAMP 
       WHERE ride_id = $1 
       RETURNING *`,
      [id]
    );

    if (updatedRide.rows.length === 0) {
      return res.status(404).json({ error: "Ride not found" });
    }

    res.json(updatedRide.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error completing ride" });
  }
});

module.exports = router;
