import { useState, useEffect } from "react";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import { FaUser, FaCar, FaBell, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DriverSettingsPage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle: {
      model: "",
      license_plate: "",
      color: "",
      capacity: 4
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login/driver");
      return;
    }

    const fetchDriverSettings = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/driver/settings?driver_id=${loggedInUser.id}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const profile = data.profile;
          
          setUser(loggedInUser);
          setFormData({
            name: profile.name,
            email: profile.email,
            phone: profile.phone || "",
            vehicle: {
              model: profile.vehicle?.model || "",
              license_plate: profile.vehicle?.license_plate || "",
              color: profile.vehicle?.color || "",
              capacity: profile.vehicle?.capacity || 4
            }
          });
        } else {
          throw new Error("Failed to fetch driver settings");
        }
      } catch (error) {
        console.error("Error fetching driver settings:", error);
        setError("Failed to load driver settings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverSettings();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/driver/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            driver_id: user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            vehicle: formData.vehicle
          }),
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        
        // Update local storage
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
        
        setUser(updatedUser);
        setSuccess("Profile updated successfully");
        setIsEditingProfile(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError(error.message || "Network error. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-grow bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Loading settings...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

            <form onSubmit={handleSubmit}>
              {/* Profile Section */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                    <FaUser className="mr-2" />
                    Profile Information
                  </h2>
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
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
                        {formData.name}
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
                        {formData.email}
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
                        {formData.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Vehicle Section */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                    <FaCar className="mr-2" />
                    Vehicle Information
                  </h2>
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
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
                      Model
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="model"
                        value={formData.vehicle.model}
                        onChange={handleVehicleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white">
                        {formData.vehicle.model || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                      License Plate
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="license_plate"
                        value={formData.vehicle.license_plate}
                        onChange={handleVehicleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white">
                        {formData.vehicle.license_plate || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="color"
                        value={formData.vehicle.color}
                        onChange={handleVehicleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white">
                        {formData.vehicle.color || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Capacity
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="number"
                        name="capacity"
                        value={formData.vehicle.capacity}
                        onChange={handleVehicleInputChange}
                        min="1"
                        max="8"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white">
                        {formData.vehicle.capacity || "4"}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DriverSettingsPage;