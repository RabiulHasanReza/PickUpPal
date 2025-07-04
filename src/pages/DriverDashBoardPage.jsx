import { useEffect, useState } from 'react';
import DashboardHeader from '../components/DashBoardHeader';
import Footer from '../components/Footer';
import { FaCar, FaMapMarkerAlt, FaWallet, FaHistory, FaCog, FaBell, FaChartLine, FaUserAlt } from 'react-icons/fa';

const DriverDashboardPage = () => {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rideRequests, setRideRequests] = useState([
    { id: 1, passenger: 'Seyam', pickup: 'Buet', destination: 'MuhammadPur', fare: '170', distance: '10 km' },
    { id: 2, passenger: 'Reza', pickup: 'khilkhet', destination: 'Buet', fare: '200', distance: '12 km' }
  ]);
  const [currentRide, setCurrentRide] = useState(null);
  const [earnings, setEarnings] = useState({ today: '1500', week: '12000', month: '60000' });
  const [driverStatus, setDriverStatus] = useState('online');

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const storedTheme = localStorage.getItem('theme');

    if (loggedInUser) {
      setUser(loggedInUser);

      if (storedTheme === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/login';
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

  const acceptRide = (rideId) => {
    const ride = rideRequests.find(r => r.id === rideId);
    setCurrentRide(ride);
    setRideRequests(rideRequests.filter(r => r.id !== rideId));
  };

  const completeRide = () => {
    setCurrentRide(null);
  };

  const toggleDriverStatus = () => {
    setDriverStatus(prev => prev === 'online' ? 'offline' : 'online');
  };

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

      {/* Driver Dashboard Content */}
      <main className="flex-grow bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Status Bar */}
          <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`h-3 w-3 rounded-full ${driverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">{driverStatus === 'online' ? 'Online - Accepting rides' : 'Offline'}</span>
            </div>
            <button 
              onClick={toggleDriverStatus}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${driverStatus === 'online' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
            >
              {driverStatus === 'online' ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Driver Info and Controls */}
            <div className="space-y-6">
              {/* Driver Profile Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <FaUserAlt className="text-blue-600 dark:text-blue-300 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{user?.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Driver</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Rating</span>
                    <span className="font-medium text-gray-800 dark:text-white">4.92 ★</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Trips</span>
                    <span className="font-medium text-gray-800 dark:text-white">247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Member since</span>
                    <span className="font-medium text-gray-800 dark:text-white">2022</span>
                  </div>
                </div>
              </div>

              {/* Earnings Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                  <FaWallet className="mr-2 text-blue-600 dark:text-blue-300" />
                  Earnings
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Today</span>
                    <span className="font-medium text-gray-800 dark:text-white">{earnings.today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">This Week</span>
                    <span className="font-medium text-gray-800 dark:text-white">{earnings.week}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">This Month</span>
                    <span className="font-medium text-gray-800 dark:text-white">{earnings.month}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Ride Requests/Current Ride */}
            <div className="space-y-6">
              {currentRide ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                    <FaCar className="mr-2 text-blue-600 dark:text-blue-300" />
                    Current Ride
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Passenger</p>
                      <p className="font-medium text-gray-800 dark:text-white">{currentRide.passenger}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Pickup</p>
                      <p className="font-medium text-gray-800 dark:text-white flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                        {currentRide.pickup}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Destination</p>
                      <p className="font-medium text-gray-800 dark:text-white flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-green-500" />
                        {currentRide.destination}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Fare</p>
                        <p className="font-medium text-gray-800 dark:text-white">{currentRide.fare}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Distance</p>
                        <p className="font-medium text-gray-800 dark:text-white">{currentRide.distance}</p>
                      </div>
                    </div>
                    <button 
                      onClick={completeRide}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Complete Ride
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                    <FaBell className="mr-2 text-blue-600 dark:text-blue-300" />
                    Ride Requests
                  </h3>
                  {rideRequests.length > 0 ? (
                    <div className="space-y-4">
                      {rideRequests.map(ride => (
                        <div key={ride.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{ride.passenger}</p>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">4.8 ★</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-800 dark:text-white">{ride.fare}</p>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">{ride.distance}</p>
                            </div>
                          </div>
                          <div className="mb-3">
                            <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
                              <FaMapMarkerAlt className="mr-2 text-red-500" />
                              {ride.pickup}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center mt-1">
                              <FaMapMarkerAlt className="mr-2 text-green-500" />
                              {ride.destination}
                            </p>
                          </div>
                          <button 
                            onClick={() => acceptRide(ride.id)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
                          >
                            Accept Ride
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-center py-4">No ride requests available</p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Stats and Navigation */}
            <div className="space-y-6">
              {/* Weekly Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                  <FaChartLine className="mr-2 text-blue-600 dark:text-blue-300" />
                  Weekly Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Rides Completed</span>
                    <span className="font-medium text-gray-800 dark:text-white">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Hours Online</span>
                    <span className="font-medium text-gray-800 dark:text-white">18.5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Average Rating</span>
                    <span className="font-medium text-gray-800 dark:text-white">4.92 ★</span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-[#f0f4ff] dark:bg-[#5d7397] hover:bg-[#dbeafe] dark:hover:bg-[#4a5f7a] p-3 rounded-lg flex flex-col items-center transition-colors">
                    <FaHistory className="text-gray-700 dark:text-gray-200 mb-1" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Ride History</span>
                  </button>
                  <button className="bg-[#f0f4ff] dark:bg-[#5d7397] hover:bg-[#dbeafe] dark:hover:bg-[#4a5f7a] p-3 rounded-lg flex flex-col items-center transition-colors">
                    <FaWallet className="text-gray-700 dark:text-gray-200 mb-1" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Earnings</span>
                  </button>
                  <button className="bg-[#f0f4ff] dark:bg-[#5d7397] hover:bg-[#dbeafe] dark:hover:bg-[#4a5f7a] p-3 rounded-lg flex flex-col items-center transition-colors">
                    <FaCog className="text-gray-700 dark:text-gray-200 mb-1" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 p-3 rounded-lg flex flex-col items-center transition-colors"
                  >
                    <span className="text-sm text-red-600 dark:text-red-300">Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DriverDashboardPage;