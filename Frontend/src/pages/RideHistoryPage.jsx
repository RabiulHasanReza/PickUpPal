import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import { FaHistory, FaCar, FaStar, FaMoneyBillWave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RideHistoryPage = () => {
  const [user, setUser] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login/rider");
      return;
    }
    setUser(loggedInUser);

    const fetchRideHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/rider/history?rider_id=${loggedInUser.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setRideHistory(data.rides || []); // Access the 'rides' property from response
        } else {
          console.error("Failed to fetch ride history");
        }
      } catch (error) {
        console.error("Failed to fetch ride history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideHistory();
  }, [navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price) => {
    return `$${price?.toFixed(2) || "0.00"}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                <FaHistory className="inline mr-2" />
                Ride History
              </h1>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Loading ride history...
                </p>
              </div>
            ) : rideHistory.length > 0 ? (
              <div className="space-y-4">
                {rideHistory.map((ride) => (
                  <div
                    key={ride.ride_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                          <FaCar className="inline mr-2 text-blue-500" />
                          Ride #{ride.ride_id}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          {formatDate(ride.start_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 dark:text-white">
                          {formatPrice(ride.fare)}
                        </p>
                        <div className="flex items-center justify-end mt-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${
                                i < (ride.rating || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300 dark:text-gray-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          From:
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {ride.source}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          To:
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {ride.destination}
                        </p>
                      </div>
                    </div>
                    {ride.driver_name && (
                      <div className="mt-3">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Driver: {ride.driver_name}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300">
                  No ride history found
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RideHistoryPage;