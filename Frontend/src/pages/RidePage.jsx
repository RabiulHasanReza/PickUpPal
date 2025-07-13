import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import { FaCar, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";

const RidePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rideDetails, setRideDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [driverAssigned, setDriverAssigned] = useState(false);
  const [driverInfo, setDriverInfo] = useState(null);

  useEffect(() => {
    // Get ride details from location state or fetch from API
    const params = new URLSearchParams(location.search);
    const pickup = params.get("pickup");
    const destination = params.get("destination");

    // if (!pickup || !destination) {
    //   navigate('/dashboard');
    //   return;
    // }

    setRideDetails({
      pickup,
      destination,
    });

    // Simulate finding a driver (in a real app, you'd poll the server)
    const timer = setTimeout(() => {
      setIsLoading(false);
      setDriverAssigned(true);
      setDriverInfo({
        name: "John Doe",
        rating: "4.8",
        model: "Toyota Corolla",
        licensePlate: "DHA-1234",
        eta: "5 minutes",
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  const cancelRide = () => {
    // In a real app, you'd call an API to cancel the ride
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow bg-gray-100 dark:bg-gray-900 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {isLoading ? "Finding you a driver..." : "Driver assigned!"}
            </h2>

            {rideDetails && (
              <div className="mb-8 space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-red-500 mt-1 mr-3" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Pickup Location
                    </p>
                    <p className="text-gray-800 dark:text-white font-medium">
                      {rideDetails.pickup}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Destination
                    </p>
                    <p className="text-gray-800 dark:text-white font-medium">
                      {rideDetails.destination}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center py-8">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Searching for available drivers...
                </p>
              </div>
            ) : driverAssigned && driverInfo ? (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-3">
                    Your Driver
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
                      <FaCar className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {driverInfo.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Rating: {driverInfo.rating} ★
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {driverInfo.model} ({driverInfo.licensePlate})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-gray-800 dark:text-white font-medium">
                    Estimated arrival: {driverInfo.eta}
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={cancelRide}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel Ride
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RidePage;
