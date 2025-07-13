// Backend/src/utils/notify.js
let wss = null;
function setWss(server) { wss = server; }
// This function will be called to notify drivers about new ride requests
function notifyDrivers(rideData) {

  console.log("Notifying drivers about new ride:", rideData);
  if (!wss) return; // Ensure wss is set before trying to use it

  wss.clients.forEach((client) => {

    console.log("Notifying client:", client.driver_id, "Role:", client.role);
    console.log(rideData);

    if (client.readyState === 1 && client.role === 'driver') {
      console.log("Sending ride data to driver:", client.driver_id);
      client.send(JSON.stringify(rideData));
    }
  });
}

function notifyRiders(rideData) {

  console.log("Notifying riders about the driver:", rideData);
  if (!wss) return; // Ensure wss is set before trying to use it

  wss.clients.forEach((client) => {

    console.log("Notifying client:", client.rider_id, "Role:", client.role);
    console.log(rideData);

    if (client.readyState === 1 && client.role === 'rider') {
      
      client.send(JSON.stringify(rideData));
    }
  });
}
module.exports = { setWss, notifyDrivers,notifyRiders  };