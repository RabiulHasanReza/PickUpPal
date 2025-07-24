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
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";

const DriverRidePage = () => {
  const { ws } = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [rideInfo, setRideInfo] = useState({
    ride_id: "",
    origin: "",
    destination: "",
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

  // Initialize with location state if coming from dashboard
  // Update the useEffect for initial data loading
  useEffect(() => {
    // First try to get data from location state
    if (location.state?.rideInfo) {
      const { ride_id, origin, destination } = location.state.rideInfo;
      setRideInfo({ ride_id, origin, destination });

      // Get driver info from localStorage (set in DriverDashboardPage)
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

      if (loggedInUser) {
        setDriverInfo({
          driver_id: loggedInUser.id,
          name: loggedInUser.name,
          phone: loggedInUser.phone,
        });
      }

      // Save to localStorage in case of page refresh
      localStorage.setItem(
        "currentDriverRide",
        JSON.stringify({
          rideInfo: { ride_id, origin, destination },
          driverInfo: {
            driver_id: loggedInUser?.id,
            name: loggedInUser?.name,
            phone: loggedInUser?.phone,
          },
        })
      );
    }
    // If no location state, check localStorage
    else {
      const savedRide = JSON.parse(localStorage.getItem("currentDriverRide"));
      if (savedRide?.rideInfo) {
        const { ride_id, origin, destination } = savedRide.rideInfo;
        setRideInfo({ ride_id, origin, destination });
        if (savedRide.driverInfo) {
          setDriverInfo(savedRide.driverInfo);
        }
      } else {
        navigate("/driverdashboard");
      }
    }
  }, [location.state, navigate]);

  // WebSocket message handling
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Driver Ride WebSocket message:", data);

        if (data.action === "status_update") {
          switch (data.status) {
            case "arrived":
              setRideStatus("arrived");
              break;
            case "started":
              setRideStatus("in_progress");
              break;
            case "completed":
              setRideStatus("completed");
              // Save ride completion to history
              const completedRide = {
                ...rideInfo,
                end_time: new Date().toISOString(),
                status: "completed",
              };
              localStorage.setItem(
                "completedDriverRide",
                JSON.stringify(completedRide)
              );
              break;
            default:
              console.log("Unknown status:", data.status);
          }
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, rideInfo]);

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    // Send rating to backend
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          role: "driver",
          action: "rating",
          ride_id: rideInfo.ride_id,
          driver_id: driverInfo.driver_id,
          rating: rating,
          comment: feedback,
        })
      );
    }

    // After submitting, navigate back to dashboard
    localStorage.removeItem("currentDriverRide");
    navigate("/driverdashboard");
  };

  const updateRideStatus = (status) => {
    if (
      !ws ||
      ws.readyState !== WebSocket.OPEN ||
      !rideInfo.ride_id ||
      !driverInfo.driver_id
    ) {
      console.error("Cannot update status - missing required data");
      return;
    }

    let action, message;
    switch (status) {
      case "arrived":
        action = "arrival";
        message = {
          role: "driver",
          action,
          ride_id: rideInfo.ride_id,
          driver_id:driverInfo.driver_id,
        };
        break;
      case "in_progress":
        action = "start_trip";
        message = { role: "driver", action, ride_id: rideInfo.ride_id };
        break;
      case "completed":
        action = "End Trip";
        message = { role: "driver", action, ride_id: rideInfo.ride_id };
        break;
      default:
        console.error("Unknown status update");
        return;
    }

    console.log("Sending status update:", message);
    ws.send(JSON.stringify(message));
    setRideStatus(status); // Optimistic UI update
  };
  const getStatusMessage = () => {
    switch (rideStatus) {
      case "en_route":
        return "En route to pickup location";
      case "arrived":
        return "Arrived at pickup location";
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
        {/* Ride Status Banner */}
        <div
          className={`p-4 rounded-lg mb-6 ${getStatusClass()} text-center font-semibold`}
        >
          <h2 className="text-xl">{getStatusMessage()}</h2>
        </div>

        {/* Ride Information */}
<div
  className="rounded-lg shadow-md p-6 mb-6 text-white"
  style={{ backgroundColor: "#3c8daa" }}
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Driver Information */}
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

    {/* Ride Details */}
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


        {/* Status Update Buttons */}
        {rideStatus !== "completed" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 space-y-3">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">
              Update Ride Status
            </h3>

            {rideStatus === "en_route" && (
              <button
                onClick={() => updateRideStatus("arrived")}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <FaCheckCircle className="mr-2" /> Mark as Arrived
              </button>
            )}

            {rideStatus === "arrived" && (
              <button
                onClick={() => updateRideStatus("in_progress")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <FaCar className="mr-2" /> Start Trip
              </button>
            )}

            {rideStatus === "in_progress" && (
              <button
                onClick={() => updateRideStatus("completed")}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <FaCheckCircle className="mr-2" /> Complete Trip
              </button>
            )}
          </div>
        )}

        {/* Rating Section (only shown when trip is completed) */}
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
