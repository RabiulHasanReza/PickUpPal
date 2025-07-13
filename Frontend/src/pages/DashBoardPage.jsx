import { useState, useEffect, useRef } from "react";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import {
  FaSearch,
  FaHistory,
  FaWallet,
  FaCog,
  FaQuestionCircle,
  FaCar,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const startInputRef = useRef();
  const endInputRef = useRef();

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

  const driverIcon = new L.DivIcon({
    className: "",
    html: `<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#2e7d32" stroke="#fff" stroke-width="3"/><text x="14" y="19" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial">&#128663;</text></svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const storedTheme = localStorage.getItem("theme");

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

    // Fetch ride history
    const fetchRideHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/rides?rider_id=${loggedInUser.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setRideHistory(data);
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

  // // Fetch nearby drivers
  // useEffect(() => {
  //   if (pickupCoords) {
  //     fetch(`http://localhost:3000/api/driver/nearby?lat=${pickupCoords.lat}&lng=${pickupCoords.lng}&radius=0.05`)
  //       .then(res => res.json())
  //       .then(data => setNearbyDrivers(Array.isArray(data) ? data : []))
  //       .catch(() => setNearbyDrivers([]));
  //   } else {
  //     setNearbyDrivers([]);
  //   }
  // }, [pickupCoords]);

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
      // You might want to show this error to the user
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

  const handleBookRide = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to request a ride.");
        setSubmitting(false);
        return;
      }
      const body = {
        start_location: pickupLocation,
        end_location: destination,
        start_latitude: pickupCoords?.lat,
        start_longitude: pickupCoords?.lng,
        end_latitude: endCoords?.lat,
        end_longitude: endCoords?.lng,
      };
      const res = await fetch("http://localhost:3000/request-ride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        navigate(`/ride/${data.ride_id}/rider-sim`);
      } else {
        setError(data.message || "Failed to request ride");
      }
    } catch (err) {
      setError("Network or server error");
    }
    setSubmitting(false);
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
          {/* Search Bar */}
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

          {/* Welcome Section with Ride Booking */}
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
                          onMouseDown={() => selectStartSuggestion(suggestion)}
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
                        driver.current_latitude && driver.current_longitude ? (
                          <Marker
                            key={driver.driver_id}
                            position={[
                              driver.current_latitude,
                              driver.current_longitude,
                            ]}
                            icon={driverIcon}
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
                    <p className="text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">Distance:</span>{" "}
                      {(distance / 1000).toFixed(2)} km
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">Duration:</span>{" "}
                      {formatDuration(duration*5)}
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
                  {submitting ? "Requesting Ride..." : "Request Ride"}
                </button>
              </form>
            </div>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div
              onClick={() => navigate("/rider/history")}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaHistory className="text-gray-700 dark:text-gray-200 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Recent Rides
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                View your ride history
              </p>
            </div>
            <div
              onClick={() => navigate("/rider/payments")}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaWallet className="text-gray-700 dark:text-gray-200 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Payment Methods
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Manage your payments
              </p>
            </div>
            <div
              onClick={() => navigate("/rider/settings")}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaCog className="text-gray-700 dark:text-gray-200 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Settings
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Update your preferences
              </p>
            </div>
            <div
              onClick={() => navigate("/help")}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaQuestionCircle className="text-gray-700 dark:text-gray-200 mr-2" />
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
                      <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                        Ride {ride.ride_id} - {ride.status || "completed"}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(ride.req_time).toLocaleString()}
                      </p>
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

          {/* Logout Button */}
          <div className="max-w-3xl mx-auto flex justify-center">
            <button
              onClick={() => navigate("/driver/settings")}
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
