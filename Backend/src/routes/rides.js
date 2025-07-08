const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post("/ride/req", async(req,res)=>{
    const { rider_id,driver_id} = req.body;
    const newReq = await pool.query("insert into ride_req (rider_id,driver_id) values($1,$2)", [rider_id,driver_id])
})

// Table - rides, user History, payments, ratings 
router.post("/rides", async(req,res)=>{    

})

module.exports = router;