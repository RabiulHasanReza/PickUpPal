import { useState, useEffect } from "react";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import { FaUser, FaCar, FaLock, FaBell, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DriverSettingsPage = () => {
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [vehicleForm, setVehicleForm] = useState({
    model: "",
    make: "",
    year: "",
    color: "",
    licensePlate: "",
  });
  const [notifications, setNotifications] = useState({
    rideRequests: true,
    rideUpdates: true,
    earnings: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login/driver");
      return;
    }
    setUser(loggedInUser);
    setFormData({
      name: loggedInUser.name,
      email: loggedInUser.email,
      phone: loggedInUser.phone || "",
      password: "",
      confirmPassword: "",
    });

    // Fetch driver data
    const fetchData = async () => {
      try {
        // Fetch vehicle info
        const vehicleRes = await fetch(
          `http://localhost:3000/driver/vehicle?driver_id=${loggedInUser.id}`
        );
        if (vehicleRes.ok) {
          const vehicleData = await vehicleRes.json();
          setVehicle(vehicleData);
          setVehicleForm({
            model: vehicleData.model || "",
            make: vehicleData.make || "",
            year: vehicleData.year || "",
            color: vehicleData.color || "",
            licensePlate: vehicleData.license_plate || "",
          });
        }

        // Fetch settings
        const settingsRes = await fetch(
          `http://localhost:3000/driver/settings?driver_id=${loggedInUser.id}`
        );
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setNotifications(settingsData.notifications || notifications);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/driver/${user.id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            notifications,
          }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess("Profile updated successfully");
        setIsEditingProfile(false);
      } else {
        setError("Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError("Network error. Please try again.");
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:3000/driver/vehicle/${user.id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vehicleForm),
        }
      );

      if (response.ok) {
        const updatedVehicle = await response.json();
        setVehicle(updatedVehicle);
        setSuccess("Vehicle information updated successfully");
        setIsEditingVehicle(false);
      } else {
        setError("Failed to update vehicle information");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                <FaCog className="inline mr-2" />
                Settings
              </h1>
              <button
                onClick={() => navigate("/driverdashboard")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Loading settings...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Profile Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                      <FaUser className="mr-2" />
                      Profile Information
                    </h2>
                    {!isEditingProfile ? (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProfileSubmit}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg">
                      {success}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                          required
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">
                          {user.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                          required
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">
                          {user.phone || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Leave blank to keep current"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Leave blank to keep current"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* Vehicle Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                      <FaCar className="mr-2" />
                      Vehicle Information
                    </h2>
                    {!isEditingVehicle ? (
                      <button
                        onClick={() => setIsEditingVehicle(true)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsEditingVehicle(false)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleVehicleSubmit}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Make
                      </label>
                      {isEditingVehicle ? (
                        <input
                          type="text"
                          name="make"
                          value={vehicleForm.make}
                          onChange={handleVehicleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">
                          {vehicle?.make || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Model
                      </label>
                      {isEditingVehicle ? (
                        <input
                          type="text"
                          name="model"
                          value={vehicleForm.model}
                          onChange={handleVehicleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">
                          {vehicle?.model || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Year
                      </label>
                      {isEditingVehicle ? (
                        <input
                          type="text"
                          name="year"
                          value={vehicleForm.year}
                          onChange={handleVehicleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">
                          {vehicle?.year || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Color
                      </label>
                      {isEditingVehicle ? (
                        <input
                          type="text"
                          name="color"
                          value={vehicleForm.color}
                          onChange={handleVehicleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">
                          {vehicle?.color || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        License Plate
                      </label>
                      {isEditingVehicle ? (
                        <input
                          type="text"
                          name="licensePlate"
                          value={vehicleForm.licensePlate}
                          onChange={handleVehicleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">
                          {vehicle?.license_plate || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Notifications Section */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center mb-4">
                    <FaBell className="mr-2" />
                    Notifications
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rideRequests"
                        name="rideRequests"
                        checked={notifications.rideRequests}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label
                        htmlFor="rideRequests"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        New ride requests
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rideUpdates"
                        name="rideUpdates"
                        checked={notifications.rideUpdates}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label
                        htmlFor="rideUpdates"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Ride updates and status changes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="earnings"
                        name="earnings"
                        checked={notifications.earnings}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label
                        htmlFor="earnings"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Earnings updates
                      </label>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DriverSettingsPage;