const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// GET /api/distance
router.get('/distance', async (req, res) => {
  const { origin, destination } = req.query;  // getting this from query 

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: origin,
          destinations: destination,
          key: process.env.GOOGLE_MAPS_API_KEY,  // have to input the api key
          departure : now   // for traffic time 
        }
      }
    );

    res.json(response.data);    // required time will also be included here. 

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch distance' });
  }
});

module.exports = router;
