import { useState, useEffect } from "react";
import Header from "../components/Header";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import {
  FaSearchLocation,
  FaMapMarkerAlt,
  FaArrowDown,
  FaCar,
  FaMotorcycle,
  FaGasPump,
} from "react-icons/fa";
import { MdElectricCar } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination) return;
    navigate("/login", { state: { from: "search" } });
  };

  const features = [
    {
      icon: <FaCar className="text-3xl" />,
      title: "Premium Rides",
      description: "Luxury vehicles with professional drivers",
    },
    {
      icon: <FaMotorcycle className="text-3xl" />,
      title: "Bike Taxis",
      description: "Fast and affordable short-distance rides",
    },
    {
      icon: <MdElectricCar className="text-3xl" />,
      title: "Electric Vehicles",
      description: "Eco-friendly rides with zero emissions",
    },
    {
      icon: <FaGasPump className="text-3xl" />,
      title: "Fuel Efficient",
      description: "Optimized routes to save fuel and money",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#e3e7f7] to-[#d6e0f0] dark:from-[#1a2035] dark:to-[#0f172a] min-h-screen transition-all duration-500">
      <Header />

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-36 right-6 z-50 p-3 rounded-full backdrop-blur-md bg-white/80 dark:bg-gray-800/80 shadow-lg hover:scale-110 transition-all"
        aria-label="Toggle theme"
      >
        {isDark ? "🌞" : "🌙"}
      </button>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 dark:opacity-5"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-[#3c8daa] mb-6 leading-tight">
              Ride with comfort, <br />arrive with style
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your trusted partner for safe, affordable, and reliable transportation
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
          >
            <div className="p-1 bg-gradient-to-r from-blue-500 to-[#3c8daa]">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500 dark:text-blue-400">
                      <FaMapMarkerAlt />
                    </div>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Current location"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <FaArrowDown className="text-blue-500 dark:text-blue-300" />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500 dark:text-blue-400">
                      <FaMapMarkerAlt />
                    </div>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Where to?"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-[#3c8daa] hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center mt-4 shadow-lg hover:shadow-xl"
                  >
                    <FaSearchLocation className="mr-2" />
                    Find Rides Now
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shiny Logo Image Section (Preserved) */}
      {/* <div className="flex justify-center mt-12 px-4">
        <div className="relative w-64 sm:w-72 md:w-80 lg:w-[550px] h-auto rounded-xl shadow-xl overflow-hidden">
          <motion.img
            src="/logo1.png"
            alt="PickUpPal Preview"
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, delay: 1.2 }}
            className="w-full h-full object-contain"
          />
          <motion.div
            className="absolute top-0 left-[-75%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] pointer-events-none"
            animate={{ left: ["-75%", "125%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div> */}

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Why Choose PickUpPal?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#f0f4ff] dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 mx-auto text-blue-600 dark:text-blue-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
                Seamless Experience From Start to Finish
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Our intuitive app makes booking rides effortless. Track your driver in real-time, get accurate ETAs, and enjoy cashless payments - all in one place.
              </p>
              <div className="space-y-4">
                {[
                  "Real-time ride tracking",
                  "Instant fare estimates",
                  "24/7 customer support",
                  "Multiple payment options",
                  "Ride history and receipts",
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="ml-3 text-gray-700 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="relative max-w-md mx-auto">
                <img
                  src="image2.jpg"
                  alt="PickUpPal App"
                  className="w-full h-auto rounded-3xl shadow-2xl"
                />
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <img
                    src="image2.jpg"
                    alt="App Screen"
                    className="absolute top-[10%] left-[10%] w-[80%] h-[80%] rounded-2xl object-cover"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
