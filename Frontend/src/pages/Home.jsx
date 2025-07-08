import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import './Home.css';
import Footer from '../components/Footer';
import { FaSearchLocation, FaMapMarkerAlt, FaArrowDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const paragraphLines = [
  "PickUpPal is your go-to ride-sharing partner,",
  "connecting you with safe, affordable, and reliable",
  "transportation anytime, anywhere. Whether you're heading to work,",
  "catching a flight, or exploring the city, we've got you covered.",
  "With a user-friendly platform and trusted drivers,",
  "PickUpPal ensures every ride feels like a journey with a friend."
];


const Home = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSearch = (e) => {
    e.preventDefault();
    alert("you don't have an account")
    console.log('Searching ride from:', source, 'to:', destination);
    navigate('/login')
  };
  
 
  return (
    <>
      <Header />

      <div className="bg-[#e3e7f7] dark:bg-[#1f2533] min-h-screen w-full transition-colors duration-500">
        <button
          className="fixed top-40 right-4 px-4 py-2 text-xl font-bold rounded-full 
                     bg-[#f0f4ff] text-[#1e3a8a] 
                     dark:bg-[#1e293b] dark:text-[#f0f4ff] 
                     hover:bg-[#dbeafe] dark:hover:bg-[#334155] 
                     shadow-md transition-colors duration-300"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? '🌞' : '🌙'}
        </button>

        <div className="text-black dark:text-white">
          <motion.p
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center text-center text-5xl font-semibold pt-36 px-4"
          >
            Pick you up like a real pal from anywhere to everywhere
          </motion.p>

          {/* Vertical Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-8 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Enter pickup location"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex justify-center text-gray-400 py-1">
                <FaArrowDown />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center mt-4"
              >
                <FaSearchLocation className="mr-2" />
                Find Rides
              </button>
            </form>
          </motion.div>

          {/* Rest of your content remains the same */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-20 sm:px-4 md:px-10 lg:px-20 xl:px-32 mt-10">
            <div className="w-full md:w-1/2 bg-[#d3dfef] dark:bg-[#334155] p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
              {paragraphLines.map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.5 }}
                  className="text-base sm:text-lg md:text-xl text-black dark:text-white leading-relaxed mb-2"
                >
                  {line}
                </motion.p>
              ))}
            </div>
            <div className="relative w-64 sm:w-72 md:w-80 lg:w-[550px] h-auto rounded-xl shadow-lg overflow-hidden">
              <motion.img
                src="/logo1.png"
                alt="PickUpPal Preview"
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 60, delay: 1.2 }}
                className="w-full h-full object-contain"
              />
              <motion.div
                className="absolute top-0 left-[-75%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] pointer-events-none"
                animate={{ left: ['-75%', '125%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </div>

          <motion.img
            src="/image2.jpg" 
            alt="Sliding Image"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, delay: 2.5 }}
            className="mx-auto mt-12 w-64 sm:w-80 md:w-96 lg:w-[500px] h-auto rounded-lg shadow-xl"
          />
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Home;