import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useWebSocket from "../context/WebSocketContext";
import {
  FaCar,
  FaMapMarkerAlt,
  FaStar,
  FaUser,
  FaPhone,
  FaCheckCircle,
} from "react-icons/fa";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom icons
const startIcon = new L.DivIcon({
  className: "",
  html: `<svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#1976d2" stroke="#fff" stroke-width="3"/><text x="18" y="23" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">&#128663;</text></svg>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const endIcon = new L.DivIcon({
  className: "",
  html: `<svg width="34" height="34" viewBox="0 0 34 34"><rect x="1" y="1" width="32" height="32" rx="8" fill="#d32f2f" stroke="#fff" stroke-width="2"/><text x="17" y="24" font-size="18" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">&#x1F6A9;</text></svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const driverIcon = new L.DivIcon({
  className: "",
  html: `<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#2e7d32" stroke="#fff" stroke-width="3"/><text x="14" y="19" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial">&#128663;</text></svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});
// Custom map icons (add these near the other icon definitions)
const vehicleIcons = {
  Bike: new L.DivIcon({
    className: "",
    html: `<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#2e7d32" stroke="#fff" stroke-width="3"/><text x="14" y="19" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial">🚲</text></svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
  Car: new L.DivIcon({
    className: "",
    html: `<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#2e7d32" stroke="#fff" stroke-width="3"/><text x="14" y="19" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial">🚗</text></svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
  Cng: new L.DivIcon({
    className: "",
    html: `<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#2e7d32" stroke="#fff" stroke-width="3"/><text x="14" y="19" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial">🛺</text></svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
};
const DEFAULT_COORDS = {
  start_latitude: 23.8103,
  start_longitude: 90.4125,
  end_latitude: 23.87,
  end_longitude: 90.4,
};

const DriverRidePage = () => {
  const { ws } = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [rideInfo, setRideInfo] = useState({
    ride_id: "",
    origin: "",
    destination: "",
    ...DEFAULT_COORDS,
  });
  const [driverInfo, setDriverInfo] = useState({
    driver_id: "",
    name: "",
    phone: "",
  });
  const [rideStatus, setRideStatus] = useState("en_route");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [driverPosition, setDriverPosition] = useState({
    lat: DEFAULT_COORDS.start_latitude + 0.005,
    lng: DEFAULT_COORDS.start_longitude + 0.005,
  });
  const [mapReady, setMapReady] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [showArrivalNotification, setShowArrivalNotification] = useState(false);
  const simulationInterval = useRef(null);

  useEffect(() => {
    if (mapReady && rideInfo.start_latitude && rideInfo.end_latitude) {
      calculateRoute();
    }
  }, [mapReady, rideInfo]);
  useEffect(() => {
    if (routeCoords.length > 1 && rideStatus === "en_route") {
      simulateToPickup();
    }
  }, [routeCoords]);

  // Helper functions
  const getStatusMessage = () => {
    switch (rideStatus) {
      case "en_route":
        return "En route to pickup location";
      case "arrived":
        return "You have arrived at pickup location";
      case "in_progress":
        return "Trip in progress";
      case "completed":
        return "Trip completed";
      default:
        return "Waiting for status update";
    }
  };

  const getStatusClass = () => {
    switch (rideStatus) {
      case "en_route":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "arrived":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "completed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  function FlyToRoute({ routeCoords }) {
    const map = useMap();
    useEffect(() => {
      if (routeCoords && routeCoords.length > 1) {
        map.fitBounds(routeCoords, { padding: [50, 50] });
      }
    }, [routeCoords, map]);
    return null;
  }

  // Calculate route using OpenRouteService
  const calculateRoute = async () => {
    try {
      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            Authorization:
              "5b3ce3597851110001cf6248159fb5b9de2a4436a27aa58dcf630560",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: [
              [rideInfo.start_longitude, rideInfo.start_latitude],
              [rideInfo.end_longitude, rideInfo.end_latitude],
            ],
          }),
        }
      );

      const data = await response.json();
      if (data.features && data.features[0]) {
        const coords = data.features[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );
        setRouteCoords(coords);
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
      // Fallback to straight line if API fails
      setRouteCoords([
        [rideInfo.start_latitude, rideInfo.start_longitude],
        [rideInfo.end_latitude, rideInfo.end_longitude],
      ]);
    }
  };

  // Simulate driver movement to pickup location
  const simulateToPickup = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }

    setSimulationProgress(0);
    const start = {
      lat: rideInfo.start_latitude + 0.01,
      lng: rideInfo.start_longitude + 0.01,
    };
    setDriverPosition(start);

    simulationInterval.current = setInterval(() => {
      setSimulationProgress((prev) => {
        const newProgress = Math.min(prev + 1, 100);
        const ratio = newProgress / 100;

        // Simulate moving to pickup
        const newPosition = {
          lat: start.lat + (rideInfo.start_latitude - start.lat) * ratio,
          lng: start.lng + (rideInfo.start_longitude - start.lng) * ratio,
        };

        setDriverPosition(newPosition);

        if (newProgress === 100) {
          clearInterval(simulationInterval.current);
          setRideStatus("arrived");
          setShowArrivalNotification(true);
          setTimeout(() => setShowArrivalNotification(false), 3000);
        }

        return newProgress;
      });
    }, 100);
  };

  // Simulate trip to destination
  const simulateToDestination = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }

    if (!routeCoords.length) {
      console.error("No route coordinates available for simulation");
      return;
    }

    const totalPoints = routeCoords.length;
    let currentIndex = 0;
    const SPEED_FACTOR = 7; // Increase this number to go faster

    setRideStatus("in_progress");
    setSimulationProgress(0);
    setDriverPosition({
      lat: routeCoords[0][0],
      lng: routeCoords[0][1],
    });

    simulationInterval.current = setInterval(() => {
      // Skip ahead more points for faster movement
      currentIndex += SPEED_FACTOR;

      if (currentIndex >= totalPoints) {
        clearInterval(simulationInterval.current);
        simulationInterval.current = null;
        setRideStatus("completed");
        setSimulationProgress(100);
        setDriverPosition({
          lat: routeCoords[totalPoints - 1][0],
          lng: routeCoords[totalPoints - 1][1],
        });
        sendTripComplete();
        return;
      }

      const progress = Math.floor((currentIndex / totalPoints) * 100);
      setSimulationProgress(progress);
      setDriverPosition({
        lat: routeCoords[currentIndex][0],
        lng: routeCoords[currentIndex][1],
      });
    }, 100); // Reduced interval from 200ms to 100ms
  };

  const sendTripComplete = () => {
    if (!ws || !rideInfo.ride_id) {
      console.error("Cannot complete trip - missing required data");
      return;
    }

    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            role: "driver",
            action: "End Trip",
            ride_id: rideInfo.ride_id,
            driver_id: driverInfo.driver_id,
          })
        );
      } else {
        console.warn("WebSocket not connected, status update not sent");
      }
    } catch (error) {
      console.error("Error sending trip complete:", error);
    }
  };

useEffect(() => {
  console.log("[1] Initializing driver ride page...");
  
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedInUser) {
    console.log("[2] Logged in user:", loggedInUser);
    setDriverInfo(prev => ({
      ...prev,
      driver_id: loggedInUser.id,
      name: loggedInUser.name,
      phone: loggedInUser.phone,
      // Don't set vehicleType here (we'll take it from rideInfo)
    }));
  }

  if (location.state?.rideInfo) {
    console.log("[3] Ride info found in location.state:", location.state.rideInfo);
    const {
      ride_id,
      origin,
      destination,
      start_latitude,
      start_longitude,
      end_latitude,
      end_longitude,
      vehicle_type,
    } = location.state.rideInfo;

    console.log("[4] Vehicle type from rideInfo:", vehicle_type);

    const newRideInfo = {
      ride_id,
      origin: origin || "Current Location",
      destination: destination || "Uttara, Dhaka - 1231, Bangladesh",
      start_latitude: start_latitude || DEFAULT_COORDS.start_latitude,
      start_longitude: start_longitude || DEFAULT_COORDS.start_longitude,
      end_latitude: end_latitude || DEFAULT_COORDS.end_latitude,
      end_longitude: end_longitude || DEFAULT_COORDS.end_longitude,
    };

    setRideInfo(newRideInfo);
    setDriverPosition({
      lat: newRideInfo.start_latitude + 0.005,
      lng: newRideInfo.start_longitude + 0.005,
    });

    // STRICT: Use rideInfo.vehicle_type, fallback to "Car" only if undefined/null
    const vehicleType = vehicle_type ?? "Car"; // (?? checks for null/undefined)
    console.log("[5] Final vehicle type (strict from rideInfo):", vehicleType);

    setDriverInfo(prev => ({
      ...prev,
      vehicleType, // Force-set from rideInfo
    }));

    localStorage.setItem(
      "currentDriverRide",
      JSON.stringify({
        rideInfo: newRideInfo,
        driverInfo: {
          ...driverInfo, // Keep existing driver info
          vehicleType,  // Override with ride's vehicle type
        },
      })
    );
  } else {
    console.log("[6] No ride info in location.state, checking localStorage");
    const savedRide = JSON.parse(localStorage.getItem("currentDriverRide"));
    if (savedRide?.rideInfo) {
      console.log("[7] Saved ride found, vehicle type:", savedRide.driverInfo?.vehicleType);
      const loadedRideInfo = {
        ride_id: savedRide.rideInfo.ride_id,
        origin: savedRide.rideInfo.origin || "Current Location",
        destination: savedRide.rideInfo.destination || "Uttara, Dhaka - 1231, Bangladesh",
        start_latitude: savedRide.rideInfo.start_latitude || DEFAULT_COORDS.start_latitude,
        start_longitude: savedRide.rideInfo.start_longitude || DEFAULT_COORDS.start_longitude,
        end_latitude: savedRide.rideInfo.end_latitude || DEFAULT_COORDS.end_latitude,
        end_longitude: savedRide.rideInfo.end_longitude || DEFAULT_COORDS.end_longitude,
      };

      setRideInfo(loadedRideInfo);
      setDriverInfo(savedRide.driverInfo || { vehicleType: "Car" }); // Ensure vehicleType exists
      setDriverPosition({
        lat: loadedRideInfo.start_latitude + 0.001,
        lng: loadedRideInfo.start_longitude + 0.001,
      });
    }
  }

  setMapReady(true);
}, [location.state]);

// Debugging: Log driverInfo updates
useEffect(() => {
  console.log("[8] Updated driverInfo:", driverInfo);
}, [driverInfo]);
  useEffect(() => {
    if (mapReady && rideInfo.start_latitude && rideInfo.end_latitude) {
      calculateRoute();
      // Start simulation automatically when component mounts
      simulateToPickup();
    }
  }, [mapReady, rideInfo]);

  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  const startTrip = () => {
    if (!ws || !rideInfo.ride_id) {
      console.error("Cannot start trip - missing required data");
      return;
    }

    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            role: "driver",
            action: "Start Trip",
            ride_id: rideInfo.ride_id,
          })
        );
      } else {
        console.warn("WebSocket not connected, status update not sent");
      }
    } catch (error) {
      console.error("Error sending status update:", error);
    }

    simulateToDestination();
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(
          JSON.stringify({
            role: "driver",
            action: "rider_rating",
            ride_id: rideInfo.ride_id,
            driver_id: driverInfo.driver_id,
            rating: rating,
            comment: feedback,
          })
        );
      } catch (error) {
        console.error("Error submitting rating:", error);
      }
    }
    localStorage.removeItem("currentDriverRide");
    navigate("/driverdashboard");
  };

  if (!rideInfo.ride_id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading ride information...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />

      <div className="max-w-3xl mx-auto p-4 flex-grow">
        {/* Arrival Notification */}
        {showArrivalNotification && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <FaCheckCircle className="mr-2" />
            <span>You have arrived at the pickup location!</span>
          </div>
        )}
        {/* Status Banner */}
        <div
          className={`p-4 rounded-lg mb-6 ${getStatusClass()} text-center font-semibold`}
        >
          <h2 className="text-xl">{getStatusMessage()}</h2>
          {rideStatus !== "completed" && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${simulationProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Ride Information */}
        <div
          className="rounded-lg shadow-md p-6 mb-6 text-white"
          style={{ backgroundColor: "#3c8daa" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaUser className="mr-2" /> Your Information
              </h3>
              <div className="space-y-3">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  <span>{driverInfo.name}</span>
                </p>
                <div className="flex items-center">
                  <FaPhone className="mr-2 bg-white text-black rounded-full p-1" />
                  <a
                    href={`tel:${driverInfo.phone}`}
                    className="underline hover:text-gray-200"
                  >
                    {driverInfo.phone}
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaCar className="mr-2" /> Ride Details
              </h3>
              <div className="space-y-3">
                <p>
                  <span className="font-medium">Pickup:</span>{" "}
                  <span>{rideInfo.origin}</span>
                </p>
                <p>
                  <span className="font-medium">Destination:</span>{" "}
                  <span>{rideInfo.destination}</span>
                </p>
                <p>
                  <span className="font-medium">Ride ID:</span>{" "}
                  <span>{rideInfo.ride_id}</span>
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span>{rideStatus.replace(/_/g, " ")}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        {mapReady && (
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6"
            style={{ height: "400px" }}
          >
            <MapContainer
              center={[rideInfo.start_latitude, rideInfo.start_longitude]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <Marker
                position={[rideInfo.start_latitude, rideInfo.start_longitude]}
                icon={startIcon}
              >
                <Popup>Pickup Location</Popup>
              </Marker>

              <Marker
                position={[rideInfo.end_latitude, rideInfo.end_longitude]}
                icon={endIcon}
              >
                <Popup>Destination</Popup>
              </Marker>

              <Marker
                position={[driverPosition.lat, driverPosition.lng]}
                icon={vehicleIcons[driverInfo.vehicleType] || vehicleIcons.Car} // Fallback to Car if no type specified
              >
                <Popup>
                  {rideStatus === "en_route" && "Coming to pickup"}
                  {rideStatus === "arrived" && "Waiting for rider"}
                  {rideStatus === "in_progress" && "Going to destination"}
                </Popup>
              </Marker>

              {routeCoords.length > 1 && (
                <>
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{ color: "#3b82f6", weight: 5 }}
                  />
                  <FlyToRoute routeCoords={routeCoords} />
                </>
              )}
            </MapContainer>
          </div>
        )}

        {/* Status Update Buttons */}
        {rideStatus === "arrived" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 space-y-3">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">
              Update Ride Status
            </h3>

            <button
              onClick={startTrip}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FaCar className="mr-2" /> Start Trip
            </button>
          </div>
        )}

        {/* Rating Section */}
        {rideStatus === "completed" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Rate Your Rider
            </h3>
            <form onSubmit={handleRatingSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-3xl focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      {star <= (hoverRating || rating) ? (
                        <FaStar className="text-yellow-400" />
                      ) : (
                        <FaStar className="text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="feedback"
                  className="block text-gray-700 dark:text-gray-300 mb-2"
                >
                  Feedback (optional)
                </label>
                <textarea
                  id="feedback"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was your experience with this rider?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
              >
                Submit Rating
              </button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DriverRidePage;
