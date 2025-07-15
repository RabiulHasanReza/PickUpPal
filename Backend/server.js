const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const authRoutes = require("./src/routes/auth");
const map = require("./src/routes/map");
const ride = require("./src/routes/rides");
//const pool = require('../src/db'); // adjust if needed

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // Allow all origins (for development)
app.use("/api", authRoutes);
app.use("/api/map", map);
app.use("/rides", ride);

app.listen(port, () => {
  console.log(`PickUpPal listening on port ${port}`);
});
