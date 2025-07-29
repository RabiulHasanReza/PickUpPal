import { useState, useEffect, useRef } from "react";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import useWebSocket from "../context/WebSocketContext";
import {
  FaSearch,
  FaHistory,
  FaWallet,
  FaCog,
  FaQuestionCircle,
  FaCar,
  FaMapMarkerAlt,
  FaStar,
  FaUser,
  FaPhone,
  FaCheckCircle,
} from "react-icons/fa";
import { data, useNavigate } from "react-router-dom";
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
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ORS_API_KEY = "5b3ce3597851110001cf6248159fb5b9de2a4436a27aa58dcf630560";

const DashboardPage = () => {
  const { ws, connected } = useWebSocket();
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rideHistory, setRideHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState({
    start: false,
    end: false,
  });
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showArrivalNotification, setShowArrivalNotification] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [simulatedDriverPosition, setSimulatedDriverPosition] = useState(null);
  const [simulationInterval, setSimulationInterval] = useState(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fares, setFares] = useState(null);
  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  const navigate = useNavigate();
  const startInputRef = useRef();
  const endInputRef = useRef();
  const [newPromo, setNewPromo] = useState(null); // {code, discount, expiry_date}

  // Custom map icons
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

  // Add these icon definitions near the other icon definitions in DashBoardPage.jsx
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
  // Simulates driver coming to pickup
  // Simulates driver coming to pickup
  // Replace the existing simulateToPickup function in DashBoardPage.jsx with this:
  const simulateToPickup = (pickupCoords) => {
    // Clear any existing simulation
    if (simulationInterval) clearInterval(simulationInterval);

    // Start position 1km away
    const angle = Math.random() * Math.PI * 2;
    const distance = 0.01;
    const startLat = pickupCoords.lat + distance * Math.cos(angle);
    const startLng = pickupCoords.lng + distance * Math.sin(angle);

    setSimulatedDriverPosition({ lat: startLat, lng: startLng });
    setSimulationProgress(0);

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        const newProgress = Math.min(prev + 1, 100);
        const ratio = newProgress / 100;

        // Update position
        const newLat = startLat + (pickupCoords.lat - startLat) * ratio;
        const newLng = startLng + (pickupCoords.lng - startLng) * ratio;

        setSimulatedDriverPosition({ lat: newLat, lng: newLng });
        setDriverInfo((d) => ({
          ...d,
          currentLatitude: newLat,
          currentLongitude: newLng,
        }));

        // When reached pickup
        if (newProgress === 100) {
          clearInterval(interval);
          setRideStatus("driver_arrived");
          setShowArrivalNotification(true);
        }

        return newProgress;
      });
    }, 200);
    setSimulationInterval(interval);
  };

  // Simulates trip to destination
  const simulateToDestination = (startCoords, endCoords) => {
    if (simulationInterval) clearInterval(simulationInterval);

    if (!routeCoords.length) {
      console.error("No route coordinates available for simulation");
      return;
    }

    setRideStatus("trip_in_progress");
    setSimulationProgress(0);

    const totalPoints = routeCoords.length;
    const SPEED_FACTOR = 7; // Increase this to make the vehicle move faster
    const UPDATE_INTERVAL = 100; // Reduced from 200ms for smoother animation

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        const newProgress = Math.min(prev + SPEED_FACTOR, 100); // Increased progress increment
        const pointIndex = Math.floor((newProgress / 100) * (totalPoints - 1));
        const point = routeCoords[pointIndex];

        setSimulatedDriverPosition({ lat: point[0], lng: point[1] });
        setDriverInfo((d) => ({
          ...d,
          currentLatitude: point[0],
          currentLongitude: point[1],
        }));

        if (newProgress === 100) {
          clearInterval(interval);
          setRideStatus("trip_completed");
          setShowRatingForm(true);
        }

        return newProgress;
      });
    }, UPDATE_INTERVAL);

    setSimulationInterval(interval);
  };
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const storedTheme = localStorage.getItem("theme");
    const currentRide = JSON.parse(localStorage.getItem("currentRide"));

    if (!loggedInUser) {
      navigate("/login/rider");
      return;
    }

    setUser(loggedInUser);

    if (storedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    if (currentRide) {
      setActiveRide(currentRide.rideInfo);
      setDriverInfo(currentRide.driverInfo);
      setRideStatus(currentRide.rideStatus || "driver_arriving");
    }

    const fetchRideHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/rider/history?rider_id=${loggedInUser.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setRideHistory(data.rides || []);
        }
      } catch (error) {
        console.error("Failed to fetch ride history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideHistory();
  }, [navigate]);

  // Route calculation
  useEffect(() => {
    const getRoute = async () => {
      setError("");
      setRouteCoords([]);
      setDistance(null);
      setDuration(null);
      if (pickupCoords && endCoords) {
        try {
          const data = await fetchRoute(pickupCoords, endCoords);
          setRouteCoords(data.coords);
          setDistance(data.distance);
          setDuration(data.duration);
        } catch (e) {
          setError("Failed to get route/path. Try different locations.");
        }
      }
    };
    getRoute();
  }, [pickupCoords, endCoords]);

  const fetchRoute = async (start, end) => {
    const url =
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
    const body = {
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to fetch route");
    const data = await res.json();
    return {
      coords: data.features[0].geometry.coordinates.map(([lng, lat]) => [
        lat,
        lng,
      ]),
      distance: data.features[0].properties.summary.distance,
      duration: data.features[0].properties.summary.duration,
    };
  };

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) return [];

    try {
      const res = await fetch(
        `http://localhost:3000/api/map/geocode?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch suggestions");
      }

      return data.results || [];
    } catch (err) {
      console.error("Geocoding error:", err.message);
      setError(err.message);
      return [];
    }
  };

  const handleStartInput = async (e) => {
    const value = e.target.value;
    setPickupLocation(value);
    if (value.length > 2) {
      setShowSuggestions((s) => ({ ...s, start: true }));
      const suggestions = await fetchSuggestions(value);
      setStartSuggestions(suggestions);
    } else {
      setStartSuggestions([]);
      setShowSuggestions((s) => ({ ...s, start: false }));
    }
  };

  const handleEndInput = async (e) => {
    const value = e.target.value;
    setDestination(value);
    if (value.length > 2) {
      setShowSuggestions((s) => ({ ...s, end: true }));
      const suggestions = await fetchSuggestions(value);
      setEndSuggestions(suggestions);
    } else {
      setEndSuggestions([]);
      setShowSuggestions((s) => ({ ...s, end: false }));
    }
  };

  const selectStartSuggestion = (suggestion) => {
    setPickupLocation(suggestion.formatted || suggestion.display_name);
    setPickupCoords({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lng),
    });
    setStartSuggestions([]);
    setShowSuggestions((prev) => ({ ...prev, start: false }));
    endInputRef.current?.focus();
  };

  const selectEndSuggestion = (suggestion) => {
    setDestination(suggestion.formatted || suggestion.display_name);
    setEndCoords({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lng),
    });
    setEndSuggestions([]);
    setShowSuggestions((prev) => ({ ...prev, end: false }));
  };

  const handleUseCurrent = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickupCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setPickupLocation("Current Location");
        setStartSuggestions([]);
        setShowSuggestions((s) => ({ ...s, start: false }));
      },
      () => setError("Failed to get location")
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login/rider");
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");

    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  const handleBookRide = (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const rider_id = user.id;
    if (!rider_id) {
      setError("Invalid token. Cannot find user ID.");
      setSubmitting(false);
      return;
    }

    // Calculate distance in km for fare calculation
    const distanceKm = distance ? (distance / 1000).toFixed(2) : 0;

    const rideRequest = {
      role: "rider",
      action: "ride_request",
      rider_id,
      origin: pickupLocation,
      destination: destination,
      origin_latitude: pickupCoords?.lat,
      origin_longitude: pickupCoords?.lng,
      destination_latitude: endCoords?.lat,
      destination_longitude: endCoords?.lng,
      distance: distanceKm,
    };

    try {
      ws.send(JSON.stringify(rideRequest));

      // Handle the response for fare estimates
      ws.onmessage = (msg) => {
        const response = JSON.parse(msg.data);
        console.log("Received Response:", response);

        if (response.fares) {
          // Show vehicle selection modal
          setFares(response.fares);
          setAvailableVehicles([
            { type: "Bike", fare: response.fares.Bike },
            { type: "Car", fare: response.fares.Car },
            { type: "Cng", fare: response.fares.Cng },
          ]);
          setShowVehicleSelection(true);
          setSubmitting(false);
        } else if (response.status === "accepted") {
          // Existing acceptance handling
          navigate(`/ride`, {
            state: {
              driverInfo: {
                driver_id: response.driver_id,
                driver_name: response.driver_name,
                driver_phone: response.driver_phone,
                model: response.model,
                license_plate: response.license_plate,
                color: response.color,
                rideId: response.ride_id,
              },
              pickupLocation,
              destination,
              pickupCoords,
              endCoords,
            },
          });
        } else if (response.status === "no_driver_found") {
          setError("No drivers available right now.");
          setSubmitting(false);
        }
      };
    } catch (err) {
      console.error("WebSocket Error:", err);
      setError("WebSocket communication failed.");
      setSubmitting(false);
    }
  };

  const handleVehicleSelect = (vehicleType) => {
    setSelectedVehicle(vehicleType);
    setShowVehicleSelection(false);

    const vehicleSelection = {
      role: "rider",
      action: "select_vehicle",
      rider_id: user.id,
      origin: pickupLocation,
      origin_latitude: pickupCoords?.lat,
      origin_longitude: pickupCoords?.lng,
      destination: destination,
      destination_latitude: endCoords?.lat,
      destination_longitude: endCoords?.lng,
      vehicle: vehicleType,
      fare: fares[vehicleType],
    };

    ws.send(JSON.stringify(vehicleSelection));
    setSubmitting(true);
  };

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        // Handle ride acceptance
        // Handle ride acceptance after vehicle selection
        if (data.status && data.status.trim() === "accepted") {
          const newDriverInfo = {
            driverId: data.driver_id,
            name: data.driver_name,
            phone: data.driver_phone,
            model: data.model,
            licensePlate: data.license_plate,
            color: data.color,
            currentLatitude: pickupCoords?.lat,
            currentLongitude: pickupCoords?.lng,
            vehicleType: data.vehicle_type,
          };

          const newActiveRide = {
            rideId: data.ride_id,
            origin: pickupLocation,
            destination: destination,
            start_latitude: pickupCoords?.lat,
            start_longitude: pickupCoords?.lng,
            end_latitude: endCoords?.lat,
            end_longitude: endCoords?.lng,
            vehicle: selectedVehicle,
            fare: fares[selectedVehicle],
          };

          setDriverInfo(newDriverInfo);
          setActiveRide(newActiveRide);
          setRideStatus("driver_arriving");

          if (pickupCoords) {
            simulateToPickup(pickupCoords);
          }

          localStorage.setItem(
            "currentRide",
            JSON.stringify({
              driverInfo: newDriverInfo,
              rideInfo: newActiveRide,
              rideStatus: "driver_arriving",
            })
          );
        }
        // Handle trip start (triggered by driver clicking Start Trip)
        else if (data.status === "Start Trip") {
          setRideStatus("trip_in_progress");

          // Get the current ride coordinates from state or local storage
          const currentRide =
            JSON.parse(localStorage.getItem("currentRide")) || {};
          const startCoords = {
            lat: currentRide.rideInfo?.start_latitude || pickupCoords?.lat,
            lng: currentRide.rideInfo?.start_longitude || pickupCoords?.lng,
          };
          const endCoords = {
            lat: currentRide.rideInfo?.end_latitude || endCoords?.lat,
            lng: currentRide.rideInfo?.end_longitude || endCoords?.lng,
          };

          // Start the trip simulation
          simulateToDestination(startCoords, endCoords);

          // Update localStorage
          localStorage.setItem(
            "currentRide",
            JSON.stringify({
              ...currentRide,
              rideStatus: "trip_in_progress",
            })
          );
        }
        // Handle driver arrival notification
        else if (data.status === "driver_arrived") {
          setRideStatus("driver_arrived");
          setShowArrivalNotification(true);
          setTimeout(() => setShowArrivalNotification(false), 5000);

          // Update localStorage
          const currentRide =
            JSON.parse(localStorage.getItem("currentRide")) || {};
          localStorage.setItem(
            "currentRide",
            JSON.stringify({
              ...currentRide,
              rideStatus: "driver_arrived",
            })
          );
        }
        // Handle trip completion
        else if (data.status === "Trip ended") {
          setRideStatus("trip_completed");

          // Update the active ride with fare information
          setActiveRide((prev) => ({
            ...prev,
            fare: data.Trip_Fare,
            status: "completed",
          }));

          setShowRatingForm(true);

          // Update localStorage with fare and status
          const currentRide =
            JSON.parse(localStorage.getItem("currentRide")) || {};
          localStorage.setItem(
            "currentRide",
            JSON.stringify({
              ...currentRide,
              rideInfo: {
                ...currentRide.rideInfo,
                fare: data.Trip_Fare,
                status: "completed",
              },
              rideStatus: "trip_completed",
            })
          );

          // You can also display the fare to the user here if needed
          console.log(`Trip completed. Fare: $${data.Trip_Fare}`);
        }
        // Inside your WebSocket message handler in useEffect
        else if (data.promo) {
          console.log("Received promo data:", data.promo);
          // Show the promo notification with Accept/Decline buttons
          setNewPromo({
            code: data.promo.code,
            discount: data.promo.discount,
            expiry_date: data.promo.expiry_date,
          });
        }
        // Handle fare estimates
        else if (data.fares) {
          console.log("Fare estimates received:", data.fares);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [
    ws,
    pickupLocation,
    destination,
    pickupCoords,
    endCoords,
    simulateToPickup,
  ]);

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          role: "rider",
          action: "driver_rating",
          ride_id: activeRide.rideId,
          rating: rating,
          comment: feedback,
        })
      );
    }

    localStorage.removeItem("currentRide");
    setActiveRide(null);
    setDriverInfo(null);
    setRideStatus(null);
    setShowRatingForm(false);
  };

  const cancelRide = () => {
    if (ws && ws.readyState === WebSocket.OPEN && activeRide?.rideId) {
      ws.send(
        JSON.stringify({
          role: "rider",
          action: "cancel_ride",
          ride_id: activeRide.rideId,
        })
      );
    }
    localStorage.removeItem("currentRide");
    setActiveRide(null);
    setDriverInfo(null);
    setRideStatus(null);
  };

  const onMarkerDragEnd = (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setPickupCoords({ lat: position.lat, lng: position.lng });
  };

  const blurSuggestions = (type) => {
    setTimeout(() => setShowSuggestions((s) => ({ ...s, [type]: false })), 150);
  };

  function FlyToRoute({ routeCoords }) {
    const map = useMap();
    useEffect(() => {
      if (routeCoords && routeCoords.length > 1) {
        map.fitBounds(routeCoords, { padding: [25, 25] });
      }
    }, [routeCoords, map]);
    return null;
  }

  const formatDuration = (sec) => {
    if (!sec) return "";
    const min = Math.floor(sec / 60);
    const remSec = Math.round(sec % 60);
    if (min < 60) return `${min} min${min !== 1 ? "s" : ""} ${remSec}s`;
    const hr = Math.floor(min / 60);
    const min2 = min % 60;
    return `${hr}h ${min2}min`;
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

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <button
        onClick={toggleTheme}
        className="fixed top-24 right-4 z-50 px-4 py-2 text-xl font-bold rounded-full 
                   bg-[#f0f4ff] text-[#1e3a8a] 
                   dark:bg-[#1e293b] dark:text-[#f0f4ff] 
                   hover:bg-[#dbeafe] dark:hover:bg-[#334155] 
                   shadow-md transition-colors duration-300"
        aria-label="Toggle theme"
      >
        {isDark ? "🌞" : "🌙"}
      </button>

      <main className="flex-grow bg-gray-100 dark:bg-gray-900 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          {/* Active Ride Section */}
          {activeRide && (
            <div className="max-w-3xl mx-auto mb-8">
              {/* Ride Status Banner */}
              <div
                className={`p-4 rounded-lg mb-6 ${getStatusClass()} text-center font-semibold`}
              >
                <h2 className="text-xl">{getStatusMessage()}</h2>
              </div>

              {/* Ride Information */}
              <div className="bg-[#59a8c5] dark:bg-[#456976] rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FaUser className="mr-2" /> Driver Information
                    </h3>
                    <div className="space-y-3">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        <span className="dark:text-gray-200">
                          {driverInfo.name}
                        </span>
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
                        <span className="dark:text-gray-200">
                          {activeRide.origin}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Destination:</span>{" "}
                        <span className="dark:text-gray-200">
                          {activeRide.destination}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Ride ID:</span>{" "}
                        <span className="dark:text-gray-200">
                          {activeRide.rideId}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {rideStatus !== "trip_completed" && (
                  <div className="mt-4">
                    <button
                      onClick={cancelRide}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel Ride
                    </button>
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 h-64">
                <MapContainer
                  center={[
                    activeRide.start_latitude,
                    activeRide.start_longitude,
                  ]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    at
                    tribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  <Marker
                    position={[
                      activeRide.start_latitude,
                      activeRide.start_longitude,
                    ]}
                    icon={startIcon}
                  >
                    <Popup>Pickup Location</Popup>
                  </Marker>

                  <Marker
                    position={[
                      activeRide.end_latitude,
                      activeRide.end_longitude,
                    ]}
                    icon={endIcon}
                  >
                    <Popup>Destination</Popup>
                  </Marker>

                  {driverInfo.currentLatitude &&
                    driverInfo.currentLongitude && (
                      <Marker
                        position={[
                          driverInfo.currentLatitude,
                          driverInfo.currentLongitude,
                        ]}
                        icon={vehicleIcons[selectedVehicle] || vehicleIcons.Car} // Default to Car if no selection
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

                  {driverInfo.currentLatitude &&
                    driverInfo.currentLongitude && (
                      <Marker
                        position={[
                          driverInfo.currentLatitude,
                          driverInfo.currentLongitude,
                        ]}
                        icon={vehicleIcons[selectedVehicle] || vehicleIcons.Car} // Default to Car if no selection
                      >
                        <Popup>Your Driver</Popup>
                      </Marker>
                    )}
                </MapContainer>
              </div>

              {/* Rating Form */}
              {showRatingForm && (
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
          )}
          {rideStatus === "trip_completed" && showRatingForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Trip Completed - Make Payment
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    Trip Fare:
                  </span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-300">
                    <p>৳{activeRide.fare.toFixed(2)}</p>
                    {/* {((distance / 1000) * 1.5).toFixed(2)}{" "} */}
                    {/* Example fare calculation */}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    Payment Method:
                  </span>
                  <span className="font-medium">Credit Card ****4242</span>
                </div>

                <button
                  onClick={() => {
                    // In a real app, this would connect to a payment processor
                    setPaymentStatus("processing");
                    setTimeout(() => {
                      setPaymentStatus("completed");
                      setShowRatingForm(true);
                    }, 2000);
                  }}
                  disabled={
                    paymentStatus === "processing" ||
                    paymentStatus === "completed"
                  }
                  className={`w-full py-3 rounded-lg font-medium text-white transition-colors duration-300 ${
                    paymentStatus === "processing"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : paymentStatus === "completed"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {paymentStatus === "processing"
                    ? "Processing Payment..."
                    : paymentStatus === "completed"
                      ? "Payment Successful!"
                      : "Pay Now"}
                </button>

                {paymentStatus === "completed" && (
                  <div className="flex items-center justify-center text-green-600 dark:text-green-400">
                    <FaCheckCircle className="mr-2" />
                    <span>Payment processed successfully</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Promo Code Notification */}
          {newPromo && (
            <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">🎉 New Promo Code!</h4>
                  <p className="text-sm mt-1">
                    Get {newPromo.discount}% off with:{" "}
                    <strong>{newPromo.code}</strong>
                  </p>
                  <p className="text-xs mt-1">
                    Expires:{" "}
                    {new Date(newPromo.expiry_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setNewPromo(null)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  &times;
                </button>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "http://localhost:3000/api/rider/promo",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            rider_id: user.id,
                            code: newPromo.code,
                            action: "used",
                          }),
                        }
                      );

                      if (!response.ok)
                        throw new Error("Failed to accept promo");
                      setNewPromo(null);
                    } catch (error) {
                      console.error("Error accepting promo:", error);
                    }
                  }}
                  className="flex-1 bg-white text-blue-600 py-1 rounded text-sm font-medium"
                >
                  Accept
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "http://localhost:3000/api/rider/promo",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            rider_id: user.id,
                            code: newPromo.code,
                            action: "decline",
                          }),
                        }
                      );

                      if (!response.ok)
                        throw new Error("Failed to decline promo");
                      setNewPromo(null);
                    } catch (error) {
                      console.error("Error declining promo:", error);
                    }
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-1 rounded text-sm font-medium"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          {!activeRide && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for rides, locations, or drivers..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Welcome Section with Ride Booking */}
          {!activeRide && (
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 md:p-10 rounded-xl shadow-md mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                Welcome, {user?.name}! Wanna go somewhere?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center text-sm sm:text-base">
                You are logged in as <strong>{user?.email}</strong>
              </p>

              {/* Ride Booking Section */}
              <div className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <FaCar className="mr-2" /> Quick Ride
                </h3>

                <form onSubmit={handleBookRide} className="space-y-3">
                  <div className="relative z-50">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      ref={startInputRef}
                      value={pickupLocation}
                      onChange={handleStartInput}
                      onFocus={() => {
                        if (pickupLocation.length > 2)
                          setShowSuggestions((s) => ({ ...s, start: true }));
                      }}
                      onBlur={() => blurSuggestions("start")}
                      placeholder="Enter pickup location"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-white rounded"
                      onClick={handleUseCurrent}
                    >
                      Use Current
                    </button>
                    {showSuggestions.start && startSuggestions.length > 0 && (
                      <div className="absolute z-[9999] w-full mt-1 bg-gray-400 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {startSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.place_id}
                            className="px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                            onMouseDown={() =>
                              selectStartSuggestion(suggestion)
                            }
                          >
                            {suggestion.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative z-40">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      ref={endInputRef}
                      value={destination}
                      onChange={handleEndInput}
                      onFocus={() => {
                        if (destination.length > 2)
                          setShowSuggestions((s) => ({ ...s, end: true }));
                      }}
                      onBlur={() => blurSuggestions("end")}
                      placeholder="Enter destination"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    {showSuggestions.end && endSuggestions.length > 0 && (
                      <div className="absolute z-[9999] w-full mt-1 bg-gray-400 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {endSuggestions.map((s) => (
                          <div
                            key={s.place_id}
                            className="px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                            onMouseDown={() => selectEndSuggestion(s)}
                          >
                            {s.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {pickupCoords && (
                    <div className="h-64 rounded-lg overflow-hidden relative z-10">
                      <MapContainer
                        center={pickupCoords}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                          position={[pickupCoords.lat, pickupCoords.lng]}
                          draggable={true}
                          eventHandlers={{ dragend: onMarkerDragEnd }}
                          icon={startIcon}
                        >
                          <Popup>Pickup location (drag to adjust)</Popup>
                        </Marker>
                        {endCoords && (
                          <Marker
                            position={[endCoords.lat, endCoords.lng]}
                            icon={endIcon}
                          >
                            <Popup>Dropoff location</Popup>
                          </Marker>
                        )}
                        {routeCoords.length > 1 && (
                          <>
                            <Polyline
                              positions={routeCoords}
                              pathOptions={{
                                color: "#1976d2",
                                weight: 6,
                                opacity: 0.7,
                              }}
                            />
                            <FlyToRoute routeCoords={routeCoords} />
                          </>
                        )}
                        {nearbyDrivers.map((driver) =>
                          driver.current_latitude &&
                          driver.current_longitude ? (
                            <Marker
                              key={driver.driver_id}
                              position={[
                                driver.current_latitude,
                                driver.current_longitude,
                              ]}
                              icon={
                                vehicleIcons[driver.vehicle_type] ||
                                vehicleIcons.Car
                              } // Use driver's vehicle type if available
                            >
                              <Popup>Driver #{driver.driver_id}</Popup>
                            </Marker>
                          ) : null
                        )}
                      </MapContainer>
                    </div>
                  )}

                  {distance && duration && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-gray-800 dark:text-gray-100">
                        <span className="font-semibold">Distance:</span>{" "}
                        {(distance / 1000).toFixed(2)} km
                      </p>
                      <p className="text-gray-800 dark:text-gray-100">
                        <span className="font-semibold">Duration:</span>{" "}
                        {formatDuration(duration * 5)}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="text-red-500 dark:text-red-400 text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !pickupCoords || !endCoords}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Requesting Ride..."
                      : selectedVehicle
                        ? `Request ${selectedVehicle} ${fares[selectedVehicle].toFixed(2)}`
                        : "Request Ride"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Dashboard Cards Grid */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div
              onClick={() => navigate("/rider/history")}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaHistory className="text-gray-700 dark:text-gray-100 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Recent Rides
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                View your ride history
              </p>
            </div>

            <div
              onClick={() => navigate("/help")}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaQuestionCircle className="text-gray-700 dark:text-gray-100 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Help Center
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Get support
              </p>
            </div>
          </div>

          {/* Recent Activity Section */}
          {/* Recent Activity Section */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">
              Recent Activity
            </h3>
            {rideHistory.length > 0 ? (
              <div className="space-y-3">
                {rideHistory.slice(0, 3).map((ride) => (
                  <div
                    key={ride.ride_id}
                    className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                      <FaCar className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">
                        {ride.source} → {ride.destination}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(ride.start_time).toLocaleString()} • $
                        {ride.fare?.toFixed(2) || "0.00"}
                      </p>
                      {ride.driver_name && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          Driver: {ride.driver_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity found
              </p>
            )}
          </div>
          {/* Vehicle Selection Modal */}
          {showVehicleSelection && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 dark:text-white">
                  Select Your Vehicle
                </h3>
                <div className="space-y-4">
                  {availableVehicles.map((vehicle) => (
                    <button
                      key={vehicle.type}
                      onClick={() => handleVehicleSelect(vehicle.type)}
                      className="w-full flex justify-between items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center">
                        <FaCar className="mr-3 text-lg" />
                        <span className="font-medium">{vehicle.type}</span>
                      </div>
                      <span className="font-bold">
                        ৳{vehicle.fare.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowVehicleSelection(false)}
                  className="mt-4 w-full py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="max-w-3xl mx-auto flex justify-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
