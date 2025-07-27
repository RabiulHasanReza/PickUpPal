const {
    notifyDrivers,
    notifyRiders,
    getDistance,
    hasDriverSeenRider,
    notifyDriversSequentially,
    markDriverNotSeenRider
} = require("./notify");

const drivers = new Map(); // driver_id -> { ws, cur_location, available }
const indx = 10;

module.exports = function handleWebSocket(
    wss,
    pool,
    notifyDrivers,
    notifyRiders
) {
    wss.on("connection", (ws) => {
        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);
                // driver actions
                if (data.role === "driver") {
                    if (data.action === "register") {
                        ws.role = "driver";
                        ws.driver_id = data.driver_id;
                        if (drivers.has(ws.driver_id)) {                               /// If a existing driver comes online again
                            // Driver is already registered — just go online
                            drivers.get(ws.driver_id).available = true;
                            ws.send(JSON.stringify({ message: "You are now online again" }));
                        } else {
                            const vehicleRes = await pool.query(
                                "SELECT vehicle FROM vehicles WHERE driver_id = $1",
                                [ws.driver_id]
                            );
                            ws.vehicle = vehicleRes.rows[0]?.vehicle;

                            // ws.cur_location = indx;
                            // indx++;
                            // ws.cur_location = data.cur_location;                       // **** Have to fetch this from the database _ latitude and longitude
                            ws.cur_location = 2;

                            drivers.set(ws.driver_id, {
                                ws,
                                cur_location: ws.cur_location,
                                vehicle: ws.vehicle,
                                available: true,
                            });
                            console.log(`Driver registered: ${ws.driver_id}`);
                            ws.send(
                                JSON.stringify({ message: "Driver registered successfully" })
                            );
                        }
                    }
                    else if (data.action === "Go Offline") {
                        console.log(`Driver ${data.driver_id} is now offline`);

                        if (drivers.has(data.driver_id)) {
                            drivers.get(data.driver_id).available = false;
                            ws.send(JSON.stringify({ message: "You are now offline" }));
                        }
                    }
                    else if (data.action === "Start Trip") {
                        console.log(`Driver ${ws.driver_id} starts the ride ${data.ride_id}`);

                        // const Result = await pool.query(
                        //     "SELECT ride_id FROM ride_req WHERE driver_id = $1 AND status = 'booked'",
                        //     [ws.driver_id]
                        // );

                        // // Optional: checking if result is empty
                        // if (Result.rows.length === 0) {
                        //     console.error("No ride_id found for driver");
                        //     return;
                        // }

                        // ws.ride_id = Result.rows[0].ride_id;

                        await pool.query(
                            "UPDATE ride_req SET arrived_time = CURRENT_TIMESTAMP, status = 'completed' WHERE ride_id = $1",
                            [data.ride_id]
                        );
                        await pool.query(
                            "UPDATE rides SET start_time = CURRENT_TIMESTAMP WHERE ride_id = $1",
                            [data.ride_id]
                        );

                        notifyRiders({
                            status: "Start Trip",
                            driver_id: ws.driver_id,
                            ride_id: data.ride_id,
                        });
                    } else if (data.action === "End Trip") {
                        console.log(`Driver ${ws.driver_id} ended the trip`);

                        const result = await pool.query(
                            "SELECT fare, rider_id FROM rides WHERE ride_id = $1",
                            [data.ride_id]
                        );
                        const fare = result.rows[0]?.fare || 0;
                        const rider_id = result.rows[0]?.rider_id;

                        await pool.query(
                            "UPDATE rides SET  end_time =CURRENT_TIMESTAMP, status = 'completed' WHERE ride_id = $1",
                            [data.ride_id]
                        );

                        notifyRiders({
                            status: "Trip ended",
                            ride_id: data.ride_id,
                            driver_id: ws.driver_id,
                            Trip_Fare: fare,
                        });

                        //making the driver available again
                        if (drivers.has(ws.driver_id)) {
                            drivers.get(ws.driver_id).available = true;
                        }
                        if (ws.driver_id && rider_id) {
                            markDriverNotSeenRider(ws.driver_id, rider_id);
                        }
                    }
                    else if (data.action === "rider_rating") {
                        //   const { ride_id } = data;
                        console.log(
                            `Driver ${ws.driver_id} rated the rider: ${data.rating}`
                        );


                        await pool.query(
                            "INSERT INTO ratings (ride_id, rating, comment,role) VALUES ($1, $2, $3,'rider')",
                            [data.ride_id, data.rating, data.comment]
                        );

                        ws.send(JSON.stringify({ message: `rated the ride successfully` }));
                        // Call the trigger

                        notifyRiders({
                            type: "rating",
                            ride_id: data.ride_id,
                            driver_id: ws.driver_id,
                            rating: data.rating,
                            comment: data.comment,
                        });
                    }
                }
 // rider actions
                else if (data.role === "rider") {
                    // if (data.action === 'register') {
                    //     ws.role = 'rider';
                    //     ws.rider_id = data.rider_id; // optional, if you want to track user
                    //     console.log(`Rider registered: ${ws.rider_id}`);
                    //     ws.send(JSON.stringify({ message: 'Rider registered successfully' }));
                    // }
                    if (data.action === "ride_request") {
                        //   const { rider_id, origin, destination } = req.body;
                        ws.role = "rider";
                        ws.rider_id = data.rider_id;
                        console.log(`Rider registered: ${ws.rider_id}`);
                        console.log(
                            "Ride request received: ",
                            ws.rider_id,
                            " ",
                            data.origin,
                            "  ",
                            data.destination
                        );
                        // Example fare calculation
                        const distance = data.distance; // implement this function
                        const fares = {
                            Bike: distance * 10,
                            Car: distance * 20,
                            Cng: distance * 15,
                        };
                        ws.send(
                            JSON.stringify({
                                message: "Rider registered successfully  ",
                                fares,
                            })
                        );
                    } else if (data.action === "select_vehicle") {
                        //   const { rider_id, origin, destination, vehicle } = req.body;

                        console.log(
                            `Rider ${ws.rider_id} selected vehicle: ${data.vehicle}`
                        );

                        await pool.query(
                            "INSERT INTO ride_req (rider_id, status) VALUES ($1, 'available')",
                            [ws.rider_id]
                        );
                        const rideResult = await pool.query(
                            "SELECT ride_id FROM ride_req WHERE rider_id = $1 AND status = 'available'",
                            [ws.rider_id]
                        );

                        // Optional: checking if result is empty
                        if (rideResult.rows.length === 0) {
                            console.error("No ride_id found for rider");
                            return;
                        }

                        ws.ride_id = rideResult.rows[0].ride_id;

                        // Prepare ride info
                        const riderLocation = 1;
                        // const riderLocation = data.origin;                // ****** have to fix this
                        const currentRiderId = ws.rider_id;

                        console.log("Current Rider ID: ", currentRiderId);

                        const availableDrivers = Array.from(drivers.values())
                            .filter((d) => d.available)
                            .map((d) => ({
                                driver_id: d.ws.driver_id,
                                ws: d.ws,
                                cur_location: d.cur_location,
                                distance: getDistance(riderLocation, d.cur_location),
                                // availability: true,
                                hasSeenThisRider: hasDriverSeenRider(
                                    d.ws.driver_id,
                                    currentRiderId
                                ),
                                vehicle: d.vehicle,
                            }))
                            .sort((a, b) => a.cur_location - b.cur_location);

                        console.log("Available drivers: ", availableDrivers.length);
                        // Sequentially notify drivers
                        try {
                            notifyDriversSequentially(
                                availableDrivers,
                                {  //rideInfo
                                    ride_id: ws.ride_id,
                                    rider_id: ws.rider_id,
                                    origin: data.origin,
                                    origin_latitude: data.origin_latitude,
                                    origin_longitude: data.origin_longitude,
                                    destination: data.destination,
                                    destination_latitude: data.destination_latitude,
                                    destination_longitude: data.destination_longitude,
                                    vehicle: data.vehicle,
                                },
                                async (driverWs) => {
                                    // On accept

                                    drivers.get(driverWs.driver_id).available = false;

                                    await pool.query(
                                        "UPDATE ride_req SET driver_id = $1, status = 'booked', res_time = CURRENT_TIMESTAMP WHERE rider_id = $2 AND status = 'available'",
                                        [driverWs.driver_id, ws.rider_id]
                                    );

                                    // Step 1: INSERT basic ride info (without driver_id and vehicle_id for now)
                                    await pool.query(
                                        "INSERT INTO rides (ride_id, rider_id, source, destination, fare, vehicle) VALUES ($1, $2, $3, $4, $5, $6)",
                                        [
                                            ws.ride_id,
                                            ws.rider_id,
                                            data.origin,
                                            data.destination,
                                            data.fare,
                                            data.vehicle,
                                        ]
                                    );

                                    // Step 2: UPDATE the same ride row with driver & vehicle info
                                    await pool.query(
                                        `UPDATE rides
                                        SET driver_id = v.driver_id,
                                        vehicle_id = v.vehicle_id
                                             FROM vehicles v
                                         WHERE v.driver_id = $1 AND rides.ride_id = $2`,
                                        [driverWs.driver_id, ws.ride_id]
                                    );

                                    // ALl info of driver :
                                    const result = await pool.query(
                                        `
                                                SELECT 
                                            u.name AS driver_name,
                                           u.phone AS driver_phone,
                                                  v.model, 
                                              v.license_plate, 
                                                  v.color
                                                    FROM users u
                                             JOIN vehicles v ON u.id = v.driver_id
                                              WHERE u.id = $1
                                                    `,
                                        [driverWs.driver_id]
                                    );

                                    if (result.rows.length === 0) {
                                        console.error("No data found for driver");
                                        return;
                                    }
                                    const {
                                        driver_name,
                                        driver_phone,
                                        model,
                                        license_plate,
                                        color,
                                    } = result.rows[0];

                                    ws.send(
                                        JSON.stringify({
                                            status: "accepted  ",
                                            ride_id: ws.ride_id,
                                            driver_id: driverWs.driver_id,
                                            driver_name: driver_name,
                                            driver_phone: driver_phone,
                                            model: model,
                                            license_plate: license_plate,
                                            color: color,
                                        })
                                    );

                                    // notifyRiders({ status: 'accepted', ride: { driver_id: driverWs.driver_id, wss:  } });
                                },
                                async () => {
                                    // On no driver found

                                    await pool.query(
                                        "UPDATE ride_req SET  status = 'Failed' WHERE rider_id = $1 AND status = 'available'",
                                        [ws.rider_id]
                                    );

                                    ws.send(JSON.stringify({ status: "no_driver_found" }));
                                },
                                // wss,
                                drivers
                            );
                        } catch (error) {
                            console.error("Error in notifyDriversSequentially:", error);
                        }
                    } else if (data.action === "driver_rating") {
                        //   const { ride_id } = data;
                        console.log(
                            `Rider ${ws.rider_id} rated the driver: ${data.rating}`
                        );


                        await pool.query(
                            "INSERT INTO ratings (ride_id, rating, comment,role) VALUES ($1, $2, $3,'driver')",
                            [data.ride_id, data.rating, data.comment]
                        );

                        ws.send(JSON.stringify({ message: `rated the ride successfully` }));
                        // Call the trigger

                        notifyDrivers({
                            type: "rating",
                            ride_id: data.ride_id,
                            rider_id: ws.rider_id,
                            rating: data.rating,
                            comment: data.comment,
                        });
                    }
                }
            } catch (e) {
                // handle error
                console.error("Error handling message:", e);
            }
        });
        ws.on("close", () => {
            if (ws.role === "driver" && ws.driver_id) {
                drivers.delete(ws.driver_id);
            }
        });
    });
};