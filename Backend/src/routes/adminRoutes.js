const express = require("express");
const router = express.Router();
const pool = require('../../db');

// GET  /api/admin/riders
router.get("/riders", async (req, res) => { 
    try {
        const result = await pool.query(
      `SELECT name, email, phone, created_at
       FROM users
       WHERE role = 'rider'`
    );

    res.status(200).json({ riders: result.rows });
    } catch (error) {
        console.error("Error fetching riders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// GET  /api/admin/drivers
router.get("/drivers", async (req, res) => { 
    try {
         const result = await pool.query(
      `SELECT u.name, u.email, u.phone, u.created_at,
              v.model, v.license_plate, v.capacity, v.color
       FROM users u
       JOIN vehicles v ON u.id = v.driver_id
       WHERE u.role = 'driver'`
    );

    res.status(200).json({ drivers: result.rows });
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// GET  /api/admin/rides
router.get("/rides", async (req, res) => { 
    try {
        const result = await pool.query(
      `SELECT 
          r.source, r.destination, r.vehicle, r.fare, r.start_time,
          ru.name AS rider_name,
          du.name AS driver_name
       FROM rides r
       JOIN users ru ON r.rider_id = ru.id
       JOIN users du ON r.driver_id = du.id`
    );

    res.status(200).json({ rides: result.rows });
    } catch (error) {
        console.error("Error fetching rides:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//GET /api/admin/messages
router.get("/messages", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT rider_id, name, email, subject, message, created_at
             FROM rider_messages`
        );

        res.status(200).json({ messages: result.rows });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;