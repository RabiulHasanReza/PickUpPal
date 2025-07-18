const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

const handleWebSocket = require('./src/utils/wsHandler');
const { notifyDrivers, notifyRiders } = require('./src/utils/notify');
const pool = require('./db'); // adjust path as needed


// const http = require('http');
const WebSocket = require('ws');  // import WebSocket library
const { setWss } = require('./src/utils/notify'); // adjust path as needed

const maps = require('./src/routes/map');
const authRoutes = require('./src/routes/auth');
// const rideRoutes = require('../routes/rides');
// const pool = require('../src/db'); // adjust if needed

app.use(express.json());
app.use(cors()); // Allow all origins (for development)
app.use('/api', authRoutes);
app.use('/api/map',maps);
// app.use('/api', rideRoutes);


const server = app.listen(port, () => {
  console.log(`PickUpPal listening on port ${port}`);
});
// const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ride' });  // http server & websocket server working on same port
// route :  ws://localhost:3000/ride


setWss(wss); // Make wss available to notifyDrivers

// wss.on('connection',  (ws) => {        //connection is an event;when websocket is connected // ws is the WebSocket object for the connected client
//   console.log('User connected via WebSocket');
//   // You can store ws in an array if you want to broadcast to all drivers   ******
//   ws.on('message', async (message) => {
//     try {
//       const data = JSON.parse(message);
      
//     } catch (e) {
//       // handle error if needed
//     }
//   });
// });


handleWebSocket(wss, pool, notifyDrivers, notifyRiders);


// server.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });