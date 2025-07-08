const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

const authRoutes = require('../routes/auth');
// const pool = require('../src/db'); // adjust if needed

app.use(express.json());
app.use(cors()); // Allow all origins (for development)
app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`PickUpPal listening on port ${port}`);
});
