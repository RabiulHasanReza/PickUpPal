const { notifyDrivers, notifyRiders, getDistance, hasDriverSeenRider, notifyDriversSequentially } = require('./notify');

const drivers = new Map(); // driver_id -> { ws, cur_location, available }


module.exports = function handleWebSocket(wss, pool, notifyDrivers, notifyRiders) {
    wss.on('connection', (ws) => {
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                // driver actions
                if (data.role === 'driver') {
                    if (data.action === 'register') {
                        ws.role = 'driver';
                        ws.driver_id = data.driver_id;
                        ws.cur_location = data.cur_location;
                        drivers.set(ws.driver_id, { ws, cur_location: ws.cur_location, available: true });
                        console.log(`Driver registered: ${ws.driver_id}`);
                        ws.send(JSON.stringify({ message: 'Driver registered successfully' }));
                    }

                    else if (data.action === 'arrival') {
                        console.log(`Driver ${ws.driver_id} accepted the ride ${data.ride_id}`);

                        notifyRiders({ status: 'accepted', ride: { driver_id: ws.driver_id } });
                        notifyRiders({ status: 'Arrived', ride: { driver_id: ws.driver_id } });
                        notifyRiders({ status: 'Trip ended', ride: { driver_id: ws.driver_id } });
                    }
                }
// rider actions
                else if (data.role === 'rider') {
                    if (data.action === 'register') {
                        ws.role = 'rider';
                        ws.rider_id = data.rider_id; // optional, if you want to track user
                        console.log(`Rider registered: ${ws.rider_id}`);
                        ws.send(JSON.stringify({ message: 'Rider registered successfully' }));
                    }
                    else if (data.action === 'ride_request') {
                        //   const { rider_id, origin, destination } = req.body;
                        console.log("Ride request received: ", ws.rider_id, " ", data.origin, "  ", data.destination);
                        // Example fare calculation
                        const distance = 30; // implement this function
                        const fares = {
                            bike: distance * 10,
                            car: distance * 20,
                            cng: distance * 15
                        };
                        ws.send(JSON.stringify({ fares }));
                    }
                    else if (data.action === 'select_vehicle') {
                        //   const { rider_id, origin, destination, vehicle } = req.body;

                        console.log(`Rider ${ws.rider_id} selected vehicle: ${data.vehicle}`);

                        await pool.query(
                            "INSERT INTO ride_req (rider_id, status) VALUES ($1, 'available')",
                            [ws.rider_id,]
                        );
                        await pool.query(
                            "INSERT INTO rides ( source, destination, vehicle) VALUES ($1, $2, $3 )",
                            [data.origin, data.destination, data.vehicle]
                        );

                        // Prepare ride info
                        const riderLocation = 1;// fixed
                        const currentRiderId = ws.rider_id;

                        console.log("Current Rider ID: ", currentRiderId);
                        const availableDrivers = Array.from(drivers.values())
                            .filter(d => d.available)
                            .map(d => ({

                                driver_id: d.ws.driver_id,
                                ws: d.ws,
                                cur_location: d.cur_location,
                                distance: getDistance(riderLocation, d.cur_location),
                                availability: true,
                                hasSeenThisRider: hasDriverSeenRider(d.ws.driver_id, currentRiderId)
                            }))
                            .sort((a, b) => a.distance - b.distance);



                        console.log("Available drivers: ", availableDrivers.length);
                        // Sequentially notify drivers
                        try {
                            notifyDriversSequentially(
                                availableDrivers,
                                {
                                    rider_id: ws.rider_id,
                                    origin: data.origin,
                                    destination: data.destination,
                                    vehicle: data.vehicle
                                },
                                (driverWs) => {
                                    // On accept
                                    ws.send(JSON.stringify({ status: 'accepted', driver_id: driverWs.driver_id }));
                                    drivers.get(driverWs.driver_id).available = false;
                                },
                                () => {
                                    // On no driver found
                                    ws.send(JSON.stringify({ status: 'no_driver_found' }));
                                },
                                wss,
                                 drivers
                            );
                        }
                        catch (error) {
                            console.error("Error in notifyDriversSequentially:", error);
                        }



                    }
                    else if (data.action === 'rating') {
                        //   const { ride_id } = data;
                        console.log(`Rider ${ws.rider_id} rated the driver: ${data.rating}`);
                        ws.send(JSON.stringify({ message: `rated the ride successfully` }));
                        notifyDrivers({ type: 'rating', ride: { rider_id: ws.rider_id, rating: data.rating } });
                    }


                }
            } catch (e) {
                // handle error
            }
        });
        ws.on('close', () => {
            if (ws.role === 'driver' && ws.driver_id) {
                drivers.delete(ws.driver_id);
            }
        });
    });
};