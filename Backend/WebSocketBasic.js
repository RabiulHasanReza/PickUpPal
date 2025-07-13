const express  = require('express');
const app      = express();

const port     = 4000;
const portw     = 8000;
const WebSocketServer = require('ws');  // import WebSocket library

const server = app.listen(port, () => {          //Internally creates an HTTP server using Node's http module.So technically, app.listen() returns an instance of the HTTP server, not the Express app itself.
  console.log(`Server listening on port ${port}`);
});

const wss = new WebSocketServer.Server({ server }); // http server & websocket server working on the same port
// const wss = new WebSocketServer.Server({ port: portw });  // http server & websocket server working on different ports

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
    ws.on('message', (data) => {  //"message" is the event name in WebSocket — it gets triggered whenever a client sends something to the server.
        console.log("Received message: ", data);
        ws.send("Thank you for your message!"); // server sends a response back to the client
    });
});
