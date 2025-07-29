const express = require("express");
const router = express.Router();

const driverRoutes = require("./driverRoutes");
const riderRoutes = require("./riderRoutes");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const maps = require('./map');


router.use("/driver", driverRoutes);
router.use("/rider", riderRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/map", maps);


module.exports = router;