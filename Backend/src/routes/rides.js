const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { notifyDrivers } = require('../utils/notify');

router.post("/ride", async (req, res) => {
    const { rider_id, origin, destination, vehicle_type } = req.body;
    console.log("Ride request received:", req.body);
    // Example fare calculation
    const distance = 30; // implement this function
    const fares = {
        bike: distance * 10,
        car: distance * 20,
        cng: distance * 15
    };

    if (!vehicle_type) {
        // Step 1: Respond with fare options
        return res.json({ fares });
    } else {
        // Step 2: Book the ride
        await pool.query(
            "INSERT INTO ride_req (rider_id, status) VALUES ($1, 'available')",
            [rider_id,]
        );
        await pool.query(
            "INSERT INTO rides ( source, destination, vehicle) VALUES ($1, $2, $3 )",
            [origin, destination, vehicle_type]
        );
        //  after inserting into DB:
        notifyDrivers({ type: 'new_ride', ride: { origin, destination, rider_id } });

        return res.json({ message: "Ride request created", status: "available" });
    }
});


// Driver accepts or starts a ride (combined route)
router.post("/ride/driver-action", async (req, res) => {
    const { action, ride_id, driver_id, rider_id } = req.body;
    if (action === "accept") {
        await pool.query(
            "UPDATE ride_req SET driver_id = $1, status = 'booked' WHERE id = $2 AND status = 'available'",
            [driver_id, ride_id]
        );
        // Notify rider (WebSocket)
        notifyRider({ type: 'driver_arriving', ride_id, driver_id });
        return res.json({ message: "Ride accepted, driver is arriving" });
    }
    else if (action === "start") {
        const startTime = new Date();
        await pool.query(
            "UPDATE ride_req SET start_time = $1, status = 'ongoing' WHERE id = $2 AND status = 'booked'",
            [startTime, ride_id]
        );
        notifyRider({ type: 'trip_started', ride_id, start_time: startTime });
        return res.json({ message: "Trip started" });
    } else {
        return res.status(400).json({ error: "Invalid action" });
    }
});
router.post("/ride/complete", async (req, res) => {
    const { ride_id, fare } = req.body;
    const endTime = new Date();
    await pool.query(
        "UPDATE ride_req SET end_time = $1, fare = $2, status = 'completed' WHERE id = $3 AND status = 'ongoing'",
        [endTime, fare, ride_id]
    );
    // Notify rider (WebSocket)
    notifyRider({ type: 'trip_completed', ride_id, end_time: endTime, fare });
    res.json({ message: "Trip completed" });
});



module.exports = router;