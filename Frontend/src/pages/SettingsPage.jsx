import { useState, useEffect } from "react";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import { FaUser, FaLock, FaBell, FaLanguage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    rideUpdates: true,
    promotions: false,
    news: false,
  });
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login/rider");
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

    // Fetch user settings
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/user/settings?user_id=${loggedInUser.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || notifications);
          setLanguage(data.language || "en");
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/user/${user.id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            notifications,
            language,
          }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess("Profile updated successfully");
        setIsEditing(false);
      } else {
        setError("Failed to update profile");
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
                Settings
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
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmit}
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
                      {isEditing ? (
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
                      {isEditing ? (
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
                      {isEditing ? (
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

                  {isEditing && (
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
                        id="promotions"
                        name="promotions"
                        checked={notifications.promotions}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label
                        htmlFor="promotions"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Promotions and discounts
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="news"
                        name="news"
                        checked={notifications.news}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label
                        htmlFor="news"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        News and updates
                      </label>
                    </div>
                  </div>
                </section>

                {/* Language Section */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center mb-4">
                    <FaLanguage className="mr-2" />
                    Language Preferences
                  </h2>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                  </select>
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

export default SettingsPage;