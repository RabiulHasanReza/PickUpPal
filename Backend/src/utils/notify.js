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
      // console.log("Sending ride data to driver:", client.driver_id);
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

// Helper: Calculate distance between two locations (lat/lng)
function getDistance(loc1, loc2) {
  if (!loc1 || !loc2) return Infinity;
  // return Math.sqrt(
  //   Math.pow(loc1.lat - loc2.lat, 2) + Math.pow(loc1.lng - loc2.lng, 2)
  // );
  if (loc1 > loc2)
    return loc1 - loc2;
  else return loc2 - loc1;
}

const driverRiderHistory = new Map(); // driver_id -> Set of rider_ids

// Example: driverRiderHistory structure looks like:
// Map {
//   "driver_123" => Set { "rider_001", "rider_002", "rider_003" },
//   "driver_456" => Set { "rider_001", "rider_004" },
//   "driver_789" => Set { "rider_002" }
// }

// Function to check if driver has seen rider before
function hasDriverSeenRider(driverId, riderId) {
    // If driver doesn't exist in history, they haven't seen anyone
    if (!driverRiderHistory.has(driverId)) {
        driverRiderHistory.set(driverId, new Set());
        return false;
    }
    
    // Check if this rider_id exists in the driver's seen set
    return driverRiderHistory.get(driverId).has(riderId);
}

// Function to mark that driver has seen this rider
function markDriverSeenRider(driverId, riderId) {
    // Create entry for driver if doesn't exist
    if (!driverRiderHistory.has(driverId)) {
        driverRiderHistory.set(driverId, new Set());
    }
    
    // Add rider to this driver's seen list
    driverRiderHistory.get(driverId).add(riderId);
    
    console.log(`Driver ${driverId} has now seen rider ${riderId}`);
}

const processingDrivers = new Set();


// Notify drivers one by one, by proximity, without pendingRides map
function notifyDriversSequentially(driversList, rideInfo, onAccept, onNoDriver, wss,driversMap) {
try
{
 let idx = 0;

    function tryNextDriver() {
        if (idx >= driversList.length) {
            setTimeout(() => {
                if (onNoDriver) onNoDriver();
            }, 20000);
            return;
        }
        
        const driver = driversList[idx];
        idx++;
        
        if (driver.ws.readyState !== 1) {
            tryNextDriver();
            return;
        }

        const driverInMap = driversMap.get(driver.driver_id);
        
        // ATOMIC CHECK AND SET
        if (driver.hasSeenThisRider || 
            !driverInMap.available || 
            processingDrivers.has(driver.driver_id)) {
            
            console.log(`skipping Driver ${driver.driver_id} for ${rideInfo.rider_id} - busy`);
            tryNextDriver();
            return;
        }

        // IMMEDIATELY mark as processing (atomic operation)
        processingDrivers.add(driver.driver_id);
        driverInMap.available = false;

        // Send request
        driver.ws.send(JSON.stringify({ type: 'new_ride', ride: rideInfo }));
        markDriverSeenRider(driver.driver_id, rideInfo.rider_id);
        let responded = false;

        // Response handler
        const responseHandler = (msg) => {
            let data;
            try { data = JSON.parse(msg); } catch { return; }
            
            if (data.action === 'accepted') {
                responded = true;
                driver.ws.removeListener('message', responseHandler);
                processingDrivers.delete(driver.driver_id); // Remove from processing
                if (onAccept) onAccept(driver.ws);
            } 
            else if (data.action === 'declined') {
                responded = true;
                driver.ws.removeListener('message', responseHandler);
                processingDrivers.delete(driver.driver_id); // Remove from processing
                driverInMap.available = true;
                tryNextDriver();
            }
        };
        
        driver.ws.once('message', responseHandler);

        // Timeout
        setTimeout(() => {
            if (!responded) {
                driver.ws.send(JSON.stringify({ type: 'EXPIRED', ride: rideInfo }));
                driver.ws.removeListener('message', responseHandler);
                processingDrivers.delete(driver.driver_id); // Remove from processing
                driverInMap.available = true;
                tryNextDriver();
            }
        }, 20000);
    }
    
    tryNextDriver();
}
catch (error) {
    console.error("Error in notifyDriversSequentially:", error);
    if (onNoDriver) onNoDriver();
  }
}

module.exports = { setWss, notifyDrivers, notifyRiders, getDistance,hasDriverSeenRider,  notifyDriversSequentially };