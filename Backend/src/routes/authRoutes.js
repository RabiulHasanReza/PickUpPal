const express = require("express");
const router = express.Router();
const pool = require("../../db");

// Rider Signup  : /api/auth/signup/rider
router.post("/signup/rider", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check email from users table
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // If already exists in users
    if (existingUser.rows.length > 0) {
      // Check if already a rider
      const existingRider = await pool.query(
        "SELECT * FROM riders WHERE rider_id = $1",
        [existingUser.rows[0].id]
      );

      if (existingRider.rows.length > 0) {
        return res.status(400).json({ error: "Email already registered as rider" });
      } else {
        const newRider = await pool.query(
          "INSERT INTO riders(rider_id) VALUES($1)",
          [existingUser.rows[0].id]
        );
        return res.json({ ...existingUser.rows[0], role: 'rider' });
      }
    }

    // Totally new Rider
    const newUser = await pool.query(
  "INSERT INTO users (name, email, phone, password, role) VALUES($1, $2, $3, $4, 'rider') RETURNING *",
  [name, email, phone, password]
);

    await pool.query(
      "INSERT INTO riders(rider_id) VALUES($1)",
      [newUser.rows[0].id]
    );

    res.json({ ...newUser.rows[0], role: 'rider' });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error during rider signup" });
  }
});

// Driver Signup : /api/auth/signup/driver
router.post("/signup/driver", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      license_num,
      model,
      license_plate,
      capacity,
      color,
      vehicle = 'car' // Default to car if not provided
    } = req.body;

    // Check email from users table
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // If already exists in users
    if (existingUser.rows.length > 0) {
      // Check if already a driver
      const existingDriver = await pool.query(
        "SELECT * FROM drivers WHERE driver_id = $1",
        [existingUser.rows[0].id]
      );

      if (existingDriver.rows.length > 0) {
        return res.status(400).json({ error: "Email already registered as driver" });
      }

      // If user exists but not driver, make them a driver
      const stats = "Active";
      await pool.query(
        "INSERT INTO drivers(driver_id, license_num, avg_rating, stats) VALUES($1, $2, $3, $4)",
        [existingUser.rows[0].id, license_num, 0.0, stats]
      );

      await pool.query(
        "INSERT INTO vehicles(driver_id, model, license_plate, capacity, color, vehicle) VALUES($1, $2, $3, $4, $5, $6)",
        [existingUser.rows[0].id, model, license_plate, capacity, color, vehicle]
      );

      return res.json({ 
        ...existingUser.rows[0],
        role: 'driver',
        vehicle 
      });
    }

    // Totally new Driver
    const newUser = await pool.query(
  "INSERT INTO users (name, email, phone, password, role) VALUES($1, $2, $3, $4, 'driver') RETURNING *",
  [name, email, phone, password]
);

    const stats = "Active";
    await pool.query(
      "INSERT INTO drivers(driver_id, license_num, avg_rating, stats) VALUES($1, $2, $3, $4)",
      [newUser.rows[0].id, license_num, 0.0, stats]
    );

    await pool.query(
      "INSERT INTO vehicles(driver_id, model, license_plate, capacity, color, vehicle) VALUES($1, $2, $3, $4, $5, $6)",
      [newUser.rows[0].id, model, license_plate, capacity, color, vehicle]
    );

    res.json({ 
      ...newUser.rows[0],
      role: 'driver',
      vehicle 
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error during driver signup" });
  }
});

// Rider Login : /api/auth/login/rider
router.post("/login/rider", async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (oldUser.rows.length > 0) {
      const oldRider = await pool.query(
        "SELECT * FROM riders WHERE rider_id = $1",
        [oldUser.rows[0].id]
      );

      if (oldRider.rows.length > 0) {
        res.json({ ...oldUser.rows[0], role: 'rider' });
      } else {
        res.status(400).json({ error: "Registered as user but not as rider" });
      }
    } else {
      res.status(400).json({ error: "Not registered as user" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error during rider login" });
  }
});

// Driver Login : /api/auth/login/driver
router.post("/login/driver", async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (oldUser.rows.length > 0) {
      const oldDriver = await pool.query(
        "SELECT * FROM drivers WHERE driver_id = $1",
        [oldUser.rows[0].id]
      );

      if (oldDriver.rows.length > 0) {
        // Get vehicle type for driver
        const vehicle = await pool.query(
          "SELECT vehicle FROM vehicles WHERE driver_id = $1 LIMIT 1",
          [oldUser.rows[0].id]
        );
        
        const response = { ...oldUser.rows[0], role: 'driver' };
        if (vehicle.rows.length > 0) {
          response.vehicle = vehicle.rows[0].vehicle;
        }
        
        res.json(response);
      } else {
        res.status(400).json({ error: "Registered as user but not as driver" });
      }
    } else {
      res.status(400).json({ error: "Not registered as user" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error during driver login" });
  }
});

// Admin Login : /api/auth/login/admin
router.post("/login/admin", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Hardcoded admin credentials
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    if (email === adminEmail && password === adminPassword) {
      return res.status(200).json({ message: "Admin login successful" });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
     
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error during admin login" });
  }
});

module.exports = router;