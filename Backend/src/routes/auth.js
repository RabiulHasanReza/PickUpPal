const express = require('express');
const router = express.Router();
const pool = require('../../db'); 

// Rider Signup
router.post("/signup/rider", async (req, res) => {
   try {
        const { name, email, phone, password } = req.body;

        // Check email from users table
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        //If already exists in users
        if (existingUser.rows.length > 0) {

            //Check Id in Rider 
            const existingRider = await pool.query(
                "select * from users where email = $1 and id in (select rider_id from riders)", [email]
            );

            if (existingRider.rows.length > 0) {
                
                return res.status(400).json({ error: "Email already registered" });
            }
            else {

                const newRider = await pool.query("insert into riders(rider_id) select id from users where email = $1", [email])
                res.json(newRider.rows[0]);
            }
        }

        // Totally new Rider
        else {
            const newUser = await pool.query("insert into users (name,email,phone,password) values($1,$2,$3,$4) returning *", [name, email, phone, password]) // newUser is an object

            const newRider = await pool.query("insert into riders(rider_id) select id from users where email = $1", [email])

            res.json(newUser.rows[0]);
            // console.log(newUser)
        }

    } catch (error) {
        console.log(error.message)
    }

    //     console.log(name)
    //   res.json(req.body.name)
});

// Driver Signup
router.post("/signup/driver", async (req, res) => {
   try {
        const { name, email, phone, password, license_num, model, license_plate, capacity, color } = req.body;

        // Check email from users table
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        //If already exists in users
        if (existingUser.rows.length > 0) {

            //Check Id in Driver 
            const existingDriver = await pool.query(
                "select * from users where email = $1 and id in (select driver_id from drivers)", [email]
            );


            if (existingDriver.rows.length > 0) {

                return res.status(400).json({ error: "Email already registered" });
            }
            else {

                let stats = 'Active';
                const newDriver = await pool.query("insert into drivers(driver_id, license_num, avg_rating, stats) values($1,$2,$3,$4)", [existingUser.rows[0].id, license_num, 0.0, stats])

                const newDriver2 = await pool.query("insert into vehicles(driver_id, model, license_plate, capacity, color) values($1,$2,$3,$4,$5)", [existingUser.rows[0].id, model, license_plate, capacity, color])

                res.json({
                    user: newDriver.rows[0],
                    driver: newDriver2.rows[0]
                });
            }
        }

        // Totally new Driver
        else {

            const newUser = await pool.query("insert into users (name,email,phone,password) values($1,$2,$3,$4) returning *", [name, email, phone, password]) // newUser is an object

            let stats = 'Active';
            const newDriver = await pool.query("insert into drivers(driver_id, license_num, avg_rating, stats) values($1,$2,$3,$4) returning *", [newUser.rows[0].id, license_num, 0.0, stats])

            const newDriver2 = await pool.query("insert into vehicles(driver_id, model, license_plate, capacity, color) values($1,$2,$3,$4,$5) returning *", [newUser.rows[0].id, model, license_plate, capacity, color])

            res.json({
                user: newUser.rows[0],
                driver: newDriver.rows[0]
            });
            // console.log(newUser)
        }

    } catch (error) {
        console.log(error.message)
    }

    //     console.log(name)
    //   res.json(req.body.name)
});

// Rider Login
router.post("/login/rider", async (req, res) => {
   const {email, password} = req.body;

    const oldUser = await pool.query("select * from users where email = $1 and password = $2 ", [email,password]);

    if(oldUser.rows.length > 0)
    {
        const oldRider = await pool.query("select * from riders where rider_id = $1",[oldUser.rows[0].id])

        if(oldRider.rows.length > 0 )
        {
            // res.json("Successfully logged in as a Rider")
            res.json(oldUser.rows[0])
        }
        else 
        {
             return res.status(400).json({ error: "registered as a user but, Not registered as a Rider" });
        }
    }
    else 
    {
       return res.status(400).json({ error: "Not registered as a user" });
    }

});

// Driver Login
router.post("/login/driver", async (req, res) => {
  const {email, password} = req.body;

    const oldUser = await pool.query("select * from users where email = $1 and password = $2 ", [email,password]);

    if(oldUser.rows.length > 0)
    {
        const oldDriver = await pool.query("select * from drivers where driver_id = $1",[oldUser.rows[0].id])

        if(oldDriver.rows.length > 0 )
        {
            // res.json("Successfully logged in as a Rider")
            res.json(oldUser.rows[0])
        }
        else 
        {
             return res.status(400).json({ error: "registered as a user but, Not registered as a Driver" });
        }
    }
    else 
    {
       return res.status(400).json({ error: "Not registered as a user" });
    }
});

module.exports = router;
