const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

const handleWebSocket = require('./src/utils/wsHandler');
const { notifyDrivers, notifyRiders } = require('./src/utils/notify');
const pool = require('./db'); // adjust path as needed
const routes = require("./src/routes");


const WebSocket = require('ws');  // import WebSocket library
const { setWss } = require('./src/utils/notify'); // adjust path as needed


app.use(express.json());
app.use(cors()); // Allow all origins (for development)
app.use("/api", routes);


const server = app.listen(port, () => {
  console.log(`PickUpPal listening on port ${port}`);
});

// route :  ws://localhost:3000/ws/ride
const wss = new WebSocket.Server({ server, path: '/ws/ride' });  // http server & websocket server working on same port



setWss(wss); // Make wss available to notifyDrivers



handleWebSocket(wss, pool, notifyDrivers, notifyRiders);

