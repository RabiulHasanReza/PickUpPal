import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const DriverSignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    licenseNum: "",
    model: "",
    licensePlate: "",
    capacity: "4",
    color: "White",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));

      const response = await fetch("http://localhost:3000/api/driver/vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driver_id: user.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit vehicle details");
      }

      navigate("/driverdashboard");
    } catch (err) {
      setError(err.message || "Failed to submit details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-[#e3e7f7] dark:bg-[#1f2533] min-h-screen flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8 transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#c1d2e7] dark:bg-[#334155] rounded-xl shadow-lg w-full max-w-md p-6 sm:p-8 md:p-10"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 dark:text-white mb-6">
            Complete Your Driver Profile
          </h2>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="licenseNum"
                className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300"
              >
                Driver's License Number
              </label>
              <input
                id="licenseNum"
                type="text"
                value={formData.licenseNum}
                onChange={handleChange}
                required
                placeholder="Enter your license number"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="model"
                className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300"
              >
                Vehicle Model
              </label>
              <input
                id="model"
                type="text"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="e.g. Toyota Corolla"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="licensePlate"
                className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300"
              >
                License Plate Number
              </label>
              <input
                id="licensePlate"
                type="text"
                value={formData.licensePlate}
                onChange={handleChange}
                required
                placeholder="e.g. DHA-1234"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="capacity"
                className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300"
              >
                Passenger Capacity
              </label>
              <select
                id="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="6">6</option>
                <option value="8">8</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="color"
                className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300"
              >
                Vehicle Color
              </label>
              <input
                id="color"
                type="text"
                value={formData.color}
                onChange={handleChange}
                required
                placeholder="e.g. White"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-base transition duration-300 disabled:opacity-70"
            >
              {isLoading ? "Submitting..." : "Complete Registration"}
            </button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default DriverSignUpPage;
