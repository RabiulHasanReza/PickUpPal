import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import {
  FaCar,
  FaMapMarkerAlt,
  FaWallet,
  FaHistory,
  FaCog,
  FaBell,
  FaChartLine,
  FaUserAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../context/WebSocketContext";

const DriverDashboardPage = () => {
  const { ws, connected } = useWebSocket();
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [earnings, setEarnings] = useState({
    today_income: 0,
    week_income: 0,
    month_income: 0,
    total_income: 0,
  });
  const [driverStatus, setDriverStatus] = useState("offline");
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({
    completedRides: 0,
    avgRating: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const storedTheme = localStorage.getItem("theme");

    if (!loggedInUser) {
      navigate("/login/driver");
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

    // Fetch driver data
    const fetchDriverData = async () => {
      try {
        // Get driver's vehicle info
        const vehicleRes = await fetch(
          `http://localhost:3000/api/driver/vehicle?driver_id=${loggedInUser.id}`
        );
        if (vehicleRes.ok) {
          const vehicleData = await vehicleRes.json();
          setVehicleInfo(vehicleData);
        }

        // Get pending ride requests for this driver
        const requestsRes = await fetch(
          `http://localhost:3000/ws/ride/req?driver_id=${loggedInUser.id}`
        );
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRideRequests(requestsData);
        }

        // Get driver's current active ride if any
        const activeRideRes = await fetch(
          `http://localhost:3000/rides/active?driver_id=${loggedInUser.id}`
        );
        if (activeRideRes.ok) {
          const activeRideData = await activeRideRes.json();
          if (activeRideData.length > 0) {
            setCurrentRide(activeRideData[0]);
          }
        }

        // Get driver status
        const dashboardRes = await fetch(
          `http://localhost:3000/api/driver/dashboard?driver_id=${loggedInUser.id}`
        );
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setWeeklyStats({
            completedRides: dashboardData.total_completed_rides || 0,
            avgRating: dashboardData.avg_rating || 0,
          });
        }

        // Note: Earnings would need to be calculated in your backend
        // This is a placeholder - you'd need to implement this endpoint
        const earningsRes = await fetch(
          `http://localhost:3000/api/driver/earnings?driver_id=${loggedInUser.id}`
        );
        if (earningsRes.ok) {
          const earningsData = await earningsRes.json();
          setEarnings({
            today_income: earningsData.today_income || 0,
            week_income: earningsData.week_income || 0,
            month_income: earningsData.month_income || 0,
            total_income: earningsData.total_income || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch driver data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverData();
  }, [navigate]);

  useEffect(() => {
    if (!ws) return;

    const handleWebSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        // Handle new ride requests in backend format
        if (data.type === "new_ride") {
          setRideRequests((prev) => {
            // Ensure the ride doesn't already exist
            if (!prev.some((req) => req.ride_id === data.ride.ride_id)) {
              return [
                ...prev,
                {
                  ride_id: data.ride.ride_id,
                  rider_id: data.ride.rider_id,
                  origin: data.ride.origin,
                  destination: data.ride.destination,
                  vehicle: data.ride.vehicle,
                  req_time: new Date().toISOString(),
                  origin_latitude: data.ride.origin_latitude,
                  origin_longitude: data.ride.origin_longitude,
                  destination_latitude: data.ride.destination_latitude,
                  destination_longitude: data.ride.destination_longitude,
                },
              ];
            }
            return prev;
          });
        }

        // Handle ride acceptance confirmation
        if (data.message === "Ride accepted successfully") {
          setCurrentRide((prev) => ({
            ...prev,
            ride_id: data.ride_id,
            status: "accepted",
          }));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.addEventListener("message", handleWebSocketMessage);
    return () => ws.removeEventListener("message", handleWebSocketMessage);
  }, [ws]);
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login/driver");
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

  // Update the acceptRide function
  const acceptRide = async (rideId) => {
    console.log("🔄 Accepting ride with ID:", rideId);

    try {
      const ride = rideRequests.find((r) => r.ride_id === rideId);
      if (!ride) {
        console.error("❌ Ride not found in rideRequests:", rideId);
        return;
      }

      console.log("✅ Ride found:", ride);

      const payload = {
        action: "accepted",
        role: "driver",
        ride_id: rideId,
      };

      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("📡 Sending WebSocket payload:", payload);
        ws.send(JSON.stringify(payload));

        ws.onmessage = (msg) => {
          console.log("📥 WebSocket message received:", msg.data);

          try {
            const response = JSON.parse(msg.data);
            console.log("✅ Parsed WebSocket response:", response);

            if (response.message === "Ride accepted successfully") {
              console.log("🎉 Ride accepted, updating state...");

              setCurrentRide({
                ride_id: rideId,
                rider_id: ride.rider_id,
                origin: ride.origin,
                destination: ride.destination,
                vehicle: ride.vehicle,
                req_time: ride.req_time,
                res_time: new Date().toISOString(),
              });

              setRideRequests((prev) =>
                prev.filter((r) => r.ride_id !== rideId)
              );

              // Navigate to driver ride page with ALL coordinates AND vehicle type
              navigate("/driver-ride", {
                state: {
                  rideInfo: {
                    ride_id: ride.ride_id,
                    origin: ride.origin,
                    destination: ride.destination,
                    start_latitude: ride.origin_latitude,
                    start_longitude: ride.origin_longitude,
                    end_latitude: ride.destination_latitude,
                    end_longitude: ride.destination_longitude,
                    vehicle_type: ride.vehicle, // Include vehicle type from ride
                  },
                  driverInfo: {
                    vehicleType:
                      vehicleInfo?.type || user?.vehicle_type || "Car", // Include driver's vehicle type
                  },
                },
              });
            }
          } catch (e) {
            console.error("❌ Failed to parse WebSocket message:", e);
          }
        };
      }
    } catch (error) {
      console.error("🔥 Unexpected error in acceptRide:", error);
    }
  };
  const declineRide = (rideId) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const declineMessage = {
      role: "driver",
      action: "decline",
      driver_id: user.id, // Your driver's ID
      ride_id: rideId,
    };

    ws.send(JSON.stringify(declineMessage));
    // Immediately remove the ride from local state
    setRideRequests((prev) => prev.filter((ride) => ride.ride_id !== rideId));
  };

  const completeRide = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/rides/${currentRide.ride_id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setCurrentRide(null);
        // Refresh earnings
        const earningsRes = await fetch(
          `http://localhost:3000/driver/earnings?driver_id=${user.id}`
        );
        if (earningsRes.ok) {
          const earningsData = await earningsRes.json();
          setEarnings(earningsData);
        }
      }
    } catch (error) {
      console.error("Complete ride error:", error);
      alert("Failed to complete ride. Please try again.");
    }
  };

  const toggleDriverStatus = async () => {
    const newStatus = driverStatus === "online" ? "offline" : "online";

    if (!user?.id) {
      alert("User not found.");
      return;
    }

    if (newStatus === "online" && !currentLocation) {
      alert("Please enable location services to go online.");
      return;
    }

    try {
      const payload =
        newStatus === "online"
          ? {
              role: "driver",
              action: "register",
              driver_id: user.id,
              cur_location: currentLocation,
            }
          : {
              role: "driver",
              action: "deregister",
              driver_id: user.id,
            };

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not connected.");
      }

      ws.send(JSON.stringify(payload));

      ws.onmessage = (msg) => {
        try {
          const response = JSON.parse(msg.data);

          if (response.message === "Driver registered successfully") {
            setDriverStatus("online");
          } else if (response.message === "Driver deregistered successfully") {
            setDriverStatus("offline");
          } else {
            console.warn("Unexpected message:", response);
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };
    } catch (error) {
      console.error("WebSocket update failed:", error);

      // Fallback to HTTP
      try {
        const response = await fetch(`http://localhost:3000/driver/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            driver_id: user.id,
            status: newStatus,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setDriverStatus(result.status || newStatus);
      } catch (httpError) {
        console.error("HTTP fallback failed:", httpError);
        alert("Failed to update status. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <DashboardHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Loading dashboard...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      {/* Theme Toggle Button */}
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

      {/* Driver Dashboard Content */}
      <main className="flex-grow bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Status Bar */}
          <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div
                className={`h-3 w-3 rounded-full ${driverStatus === "online" ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span className="text-sm font-medium">
                {driverStatus === "online"
                  ? "Online - Accepting rides"
                  : "Offline"}
              </span>
            </div>
            <button
              onClick={toggleDriverStatus}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${driverStatus === "online" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white transition-colors`}
            >
              {driverStatus === "online" ? "Go Offline" : "Go Online"}
            </button>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Driver Info and Controls */}
            <div className="space-y-6">
              {/* Driver Profile Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <FaUserAlt className="text-blue-600 dark:text-blue-300 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                      {user?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Driver
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Email
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Phone
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {user?.phone}
                    </span>
                  </div>
                  {vehicleInfo && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">
                          Vehicle
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {vehicleInfo.model}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">
                          License Plate
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {vehicleInfo.license_plate}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Earnings Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                  <FaWallet className="mr-2 text-blue-600 dark:text-blue-300" />
                  Earnings
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Today
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      ৳{(earnings.today_income || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      This Week
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      ৳{(earnings.week_income || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      This Month
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      ৳{(earnings.month_income || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Ride Requests/Current Ride */}
            <div className=" space-y-6">
              {currentRide ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                    <FaCar className="mr-2 text-blue-600 dark:text-blue-300" />
                    Current Ride
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Ride ID
                      </p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        #{currentRide.ride_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Request Time
                      </p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {new Date(currentRide.req_time).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Accepted Time
                      </p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {currentRide.res_time
                          ? new Date(currentRide.res_time).toLocaleString()
                          : "Not yet accepted"}
                      </p>
                    </div>
                    <button
                      onClick={completeRide}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Complete Ride
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                    <FaBell className="mr-2 text-blue-600 dark:text-blue-300" />
                    Ride Requests
                  </h3>
                  {rideRequests.length > 0 ? (
                    <div className="space-y-4">
                      {rideRequests.map((ride) => (
                        <div
                          key={ride.ride_id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">
                                Ride #{ride.ride_id}
                              </p>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Rider ID: {ride.rider_id}
                              </p>
                            </div>
                          </div>
                          <div className="mb-3 space-y-2">
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="text-green-500 mr-2" />
                              <span className="text-gray-600 dark:text-gray-300">
                                From: {ride.origin}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="text-red-500 mr-2" />
                              <span className="text-gray-600 dark:text-gray-300">
                                To: {ride.destination}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FaCar className="text-blue-500 mr-2" />
                              <span className="text-gray-600 dark:text-gray-300">
                                Vehicle: {ride.vehicle}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                acceptRide(ride.ride_id);
                                navigate("/driver-ride", {
                                  state: {
                                    rideInfo: {
                                      ride_id: ride.ride_id,
                                      origin: ride.origin,
                                      destination: ride.destination,
                                      start_latitude: ride.origin_latitude,
                                      start_longitude: ride.origin_longitude,
                                      end_latitude: ride.destination_latitude,
                                      end_longitude: ride.destination_longitude,
                                      vehicle_type: ride.vehicle, // Include vehicle type from ride
                                    },
                                    driverInfo: {
                                      vehicleType:
                                        vehicleInfo?.type ||
                                        user?.vehicle_type ||
                                        "Car", // Include driver's vehicle type
                                    },
                                  },
                                });
                              }}
                              disabled={
                                driverStatus !== "online" ||
                                !ws ||
                                ws.readyState !== WebSocket.OPEN
                              }
                              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                                driverStatus === "online" &&
                                ws?.readyState === WebSocket.OPEN
                                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              Accept Ride
                            </button>

                            <button
                              onClick={() => declineRide(ride.ride_id)}
                              disabled={
                                driverStatus !== "online" ||
                                !ws ||
                                ws.readyState !== WebSocket.OPEN
                              }
                              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                                driverStatus === "online" &&
                                ws?.readyState === WebSocket.OPEN
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              Decline Ride
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-center py-4">
                      {driverStatus === "online"
                        ? "No ride requests available"
                        : "Go online to receive ride requests"}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Stats and Navigation */}
            <div className="space-y-6">
              {/* Weekly Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                  <FaChartLine className="mr-2 text-blue-600 dark:text-blue-300" />
                  Weekly Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Rides Completed
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {weeklyStats.completedRides}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Average Rating
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {weeklyStats.avgRating
                        ? weeklyStats.avgRating.toFixed(1)
                        : "Not rated yet"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate("/driver/history")}
                    className="bg-[#f0f4ff] dark:bg-[#5d7397] hover:bg-[#dbeafe] dark:hover:bg-[#4a5f7a] p-3 rounded-lg flex flex-col items-center transition-colors"
                  >
                    <FaHistory className="text-gray-700 dark:text-gray-200 mb-1" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Ride History
                    </span>
                  </button>
                  <button
                    onClick={() => navigate("/driver/earnings")}
                    className="bg-[#f0f4ff] dark:bg-[#5d7397] hover:bg-[#dbeafe] dark:hover:bg-[#4a5f7a] p-3 rounded-lg flex flex-col items-center transition-colors"
                  >
                    <FaWallet className="text-gray-700 dark:text-gray-200 mb-1" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Earnings
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DriverDashboardPage;
