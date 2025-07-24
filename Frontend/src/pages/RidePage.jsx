import { useState, useEffect } from "react";
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
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";

// Fix for default marker icons
const defaultIcon = new L.Icon({
  iconUrl:
    "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const RidePage = () => {
  const { ws } = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [rideInfo, setRideInfo] = useState({
    rideId: "",
    origin: "",
    destination: "",
    start_latitude: 0,
    start_longitude: 0,
    end_latitude: 0,
    end_longitude: 0,
  });
  const [driverInfo, setDriverInfo] = useState({
    driverId: "",
    name: "",
    phone: "",
    model: "",
    licensePlate: "",
    color: "",
    currentLatitude: 0,
    currentLongitude: 0,
  });
  const [rideStatus, setRideStatus] = useState("driver_arriving");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [showArrivalNotification, setShowArrivalNotification] = useState(false);
  const [audio] = useState(
    typeof Audio !== "undefined" ? new Audio("/notification.mp3") : null
  );

  // Update the useEffect for initial data loading
  useEffect(() => {
    if (location.state?.driverInfo) {
      console.log("✅ Loaded from location.state:", location.state);

      const driver = {
        driverId: location.state.driverInfo.driver_id,
        name: location.state.driverInfo.driver_name,
        phone: location.state.driverInfo.driver_phone,
        model: location.state.driverInfo.model,
        licensePlate: location.state.driverInfo.license_plate,
        color: location.state.driverInfo.color,
        currentLatitude: location.state.pickupCoords?.lat,
        currentLongitude: location.state.pickupCoords?.lng,
      };

      const ride = {
        rideId: location.state.driverInfo.rideId, // Using backend-provided ride_id
        origin: location.state.pickupLocation,
        destination: location.state.destination,
        start_latitude: location.state.pickupCoords?.lat,
        start_longitude: location.state.pickupCoords?.lng,
        end_latitude: location.state.endCoords?.lat,
        end_longitude: location.state.endCoords?.lng,
      };

      setDriverInfo(driver);
      setRideInfo(ride);
      setMapCenter([ride.start_latitude, ride.start_longitude]);

      localStorage.setItem(
        "currentRide",
        JSON.stringify({ driverInfo: driver, rideInfo: ride })
      );
    } else {
      const saved = JSON.parse(localStorage.getItem("currentRide"));
      if (saved) {
        setDriverInfo(saved.driverInfo);
        setRideInfo(saved.rideInfo);
        setMapCenter([
          saved.rideInfo.start_latitude,
          saved.rideInfo.start_longitude,
        ]);
      } else {
        console.warn("❌ No ride data found. Redirecting...");
        navigate("/dashboard");
      }
    }
  }, [location.state, navigate]);

// Update the useEffect for WebSocket messages
useEffect(() => {
  if (!ws) return;
  console.log("JKFkdjfksdf");
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);

      // Handle driver arrival message (matches backend format)
      if (data.status === "Arrived") {
        console.log("Driver arrived notification received");
        setRideStatus("driver_arrived");
        setShowArrivalNotification(true);
        if (audio) audio.play();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setTimeout(() => setShowArrivalNotification(false), 5000);
      }
      // Handle trip completion message
      else if (data.status === "Trip ended") {
        console.log("Trip completed notification received");
        setRideStatus("trip_completed");
        if (data.Trip_Fare) {
          localStorage.setItem("lastTripFare", data.Trip_Fare);
        }
      }
      // Handle ride acceptance (if needed)
      else if (data.status && data.ride_id) {
        console.log("Ride status update received:", data);
        if (!rideInfo.rideId) {
          setRideInfo(prev => ({
            ...prev,
            rideId: data.ride_id
          }));
          // Update localStorage
          const currentRide = JSON.parse(localStorage.getItem("currentRide")) || {};
          localStorage.setItem(
            "currentRide",
            JSON.stringify({
              ...currentRide,
              rideInfo: {
                ...currentRide.rideInfo,
                rideId: data.ride_id
              }
            })
          );
        }
      }
    } catch (err) {
      console.error("Error processing WebSocket message:", err);
    }
  };
 console.log("wtf");
  ws.addEventListener("message", handleMessage);
  return () => ws.removeEventListener("message", handleMessage);
}, [ws, audio, rideInfo.rideId]);
  useEffect(() => {
    if (!rideInfo.start_latitude || !rideInfo.start_longitude) return;

    const calculateRoute = async () => {
      try {

        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
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
        } else {
        }
      } catch (error) {
        console.error("❌ Failed to fetch route:", error);
      }
    };

    calculateRoute();
  }, [rideInfo]);

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    console.log("⭐ Submitting rating:", { rating, feedback });

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          role: "rider",
          action: "rating",
          ride_id: rideInfo.rideId,
          rating: rating,
          comment: feedback,
        })
      );
    }

    localStorage.removeItem("currentRide");
    navigate("/dashboard");
  };

  const FlyToRoute = ({ routeCoords }) => {
    const map = useMap();
    useEffect(() => {
      if (routeCoords && routeCoords.length > 1) {
        map.fitBounds(routeCoords, { padding: [50, 50] });
      }
    }, [routeCoords, map]);
    return null;
  };

  const getStatusMessage = () => {
    switch (rideStatus) {
      case "driver_arriving":
        return "Driver is arriving";
      case "driver_arrived":
        return "Driver has arrived";
      case "trip_in_progress":
        return "Going to destination";
      case "trip_completed":
        return "Trip completed";
      default:
        return "Waiting for driver";
    }
  };

  const getStatusClass = () => {
    switch (rideStatus) {
      case "driver_arriving":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "driver_arrived":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "trip_in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "trip_completed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (!rideInfo.rideId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading ride information...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />

      {showArrivalNotification && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
            <FaCheckCircle className="text-xl mr-2" />
            <div>
              <p className="font-semibold">Your driver has arrived!</p>
              <p className="text-sm">
                Look for {driverInfo.model} ({driverInfo.color})
              </p>
            </div>
            <button
              onClick={() => setShowArrivalNotification(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto p-4 flex-grow">
        {/* Ride Status Banner */}
        <div
          className={`p-4 rounded-lg mb-6 ${getStatusClass()} text-center font-semibold`}
        >
          <h2 className="text-xl">{getStatusMessage()}</h2>
        </div>

        {/* Ride Information */}
        <div className="bg-blue-400 dark:bg-blue-600 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaUser className="mr-2" /> Driver Information
              </h3>
              <div className="space-y-3">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  <span className="dark:text-gray-200">{driverInfo.name}</span>
                </p>
                <p>
                  <span className="font-medium">Vehicle:</span>{" "}
                  <span className="dark:text-gray-200">
                    {driverInfo.model} ({driverInfo.color})
                  </span>
                </p>
                <p>
                  <span className="font-medium">License Plate:</span>{" "}
                  <span className="dark:text-gray-200">
                    {driverInfo.licensePlate}
                  </span>
                </p>
                <div className="flex items-center">
                  <FaPhone className="mr-2" />
                  <a
                    href={`tel:${driverInfo.phone}`}
                    className="text-blue-600 dark:text-blue-300 hover:underline"
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
                  <span className="dark:text-gray-200">{rideInfo.origin}</span>
                </p>
                <p>
                  <span className="font-medium">Destination:</span>{" "}
                  <span className="dark:text-gray-200">
                    {rideInfo.destination}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Ride ID:</span>{" "}
                  <span className="dark:text-gray-200">{rideInfo.rideId}</span>
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="dark:text-gray-200">
                    {rideStatus.replace(/_/g, " ")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 h-64">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <Marker
              position={[rideInfo.start_latitude, rideInfo.start_longitude]}
              icon={defaultIcon}
            >
              <Popup>Pickup Location</Popup>
            </Marker>

            <Marker
              position={[rideInfo.end_latitude, rideInfo.end_longitude]}
              icon={defaultIcon}
            >
              <Popup>Destination</Popup>
            </Marker>

            {driverInfo.currentLatitude && driverInfo.currentLongitude && (
              <Marker
                position={[
                  driverInfo.currentLatitude,
                  driverInfo.currentLongitude,
                ]}
                icon={defaultIcon}
              >
                <Popup>Your Driver</Popup>
              </Marker>
            )}

            {routeCoords.length > 0 && (
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

        {/* Rating Section */}
        {rideStatus === "trip_completed" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Rate Your Trip
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
                  placeholder="How was your ride experience?"
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

export default RidePage;
