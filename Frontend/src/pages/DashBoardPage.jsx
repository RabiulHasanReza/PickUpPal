import { useEffect, useState } from 'react';
import DashboardHeader from '../components/DashBoardHeader';
import Footer from '../components/Footer';
import { FaSearch, FaHistory, FaWallet, FaCog, FaQuestionCircle, FaCar, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rideHistory, setRideHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const storedTheme = localStorage.getItem('theme');

    if (!loggedInUser) {
      navigate('/login/rider');
      return;
    }

    setUser(loggedInUser);

    if (storedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    // Fetch ride history
    const fetchRideHistory = async () => {
      try {
        const response = await fetch(`http://localhost:3000/rides?rider_id=${loggedInUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setRideHistory(data);
        }
      } catch (error) {
        console.error('Failed to fetch ride history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideHistory();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login/rider');
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleBookRide = async () => {
    if (!pickupLocation || !destination) {
      alert('Please enter both pickup and destination locations');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/ride_req', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rider_id: user.id,
          pickup: pickupLocation,
          destination: destination
        }),
      });

      if (response.ok) {
        const rideData = await response.json();
        alert('Ride request submitted successfully!');
        // Refresh ride history
        const historyResponse = await fetch(`http://localhost:3000/rides?rider_id=${user.id}`);
        if (historyResponse.ok) {
          const data = await historyResponse.json();
          setRideHistory(data);
        }
      } else {
        throw new Error('Failed to book ride');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book ride. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <DashboardHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
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
        {isDark ? '🌞' : '🌙'}
      </button>

      {/* Main Dashboard Content */}
      <main className="flex-grow bg-gray-100 dark:bg-gray-900 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for rides, locations, or drivers..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Welcome Section */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 md:p-10 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4 text-center">
              Welcome, {user?.name}! Wanna go somewhere?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center text-sm sm:text-base">
              You are logged in as <strong>{user?.email}</strong>
            </p>

            {/* Quick Ride Booking */}
            <div className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <FaCar className="mr-2" /> Quick Ride
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Enter pickup location"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  onClick={handleBookRide}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors duration-300"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div 
              onClick={() => navigate('/rider/history')}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaHistory className="text-gray-700 dark:text-gray-200 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Recent Rides</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">View your ride history</p>
            </div>
            <div 
              onClick={() => navigate('/rider/payments')}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaWallet className="text-gray-700 dark:text-gray-200 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Payment Methods</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your payments</p>
            </div>
            <div 
              onClick={() => navigate('/rider/settings')}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaCog className="text-gray-700 dark:text-gray-200 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Settings</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Update your preferences</p>
            </div>
            <div 
              onClick={() => navigate('/help')}
              className="bg-[#f0f4ff] dark:bg-[#5d7397] p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-2">
                <FaQuestionCircle className="text-gray-700 dark:text-gray-200 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Help Center</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Get support</p>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Recent Activity</h3>
            {rideHistory.length > 0 ? (
              <div className="space-y-3">
                {rideHistory.slice(0, 3).map((ride) => (
                  <div key={ride.ride_id} className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                      <FaCar className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                        Ride {ride.ride_id} - {ride.status || 'completed'}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(ride.req_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity found</p>
            )}
          </div>

          {/* Logout Button */}
          <div className="max-w-3xl mx-auto flex justify-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;