import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('riders');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'messages' ? 'messages' : `${activeTab}`;
      const response = await fetch(`/api/admin/${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeTab}`);
      }
      
      const result = await response.json();
      setData(result[activeTab] || result.messages || []);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear admin session and redirect to login
    navigate('/login');
  };

  const renderTable = () => {
    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    if (data.length === 0) return <div className="text-center py-8">No data available</div>;

    switch (activeTab) {
      case 'riders':
        return (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Phone</th>
                <th className="py-2 px-4 border">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((rider, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4 border">{rider.name}</td>
                  <td className="py-2 px-4 border">{rider.email}</td>
                  <td className="py-2 px-4 border">{rider.phone}</td>
                  <td className="py-2 px-4 border">{new Date(rider.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'drivers':
        return (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Phone</th>
                <th className="py-2 px-4 border">Vehicle</th>
                <th className="py-2 px-4 border">License Plate</th>
                <th className="py-2 px-4 border">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((driver, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4 border">{driver.name}</td>
                  <td className="py-2 px-4 border">{driver.email}</td>
                  <td className="py-2 px-4 border">{driver.phone}</td>
                  <td className="py-2 px-4 border">{driver.model} ({driver.color})</td>
                  <td className="py-2 px-4 border">{driver.license_plate}</td>
                  <td className="py-2 px-4 border">{new Date(driver.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'rides':
        return (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Rider</th>
                <th className="py-2 px-4 border">Driver</th>
                <th className="py-2 px-4 border">Source</th>
                <th className="py-2 px-4 border">Destination</th>
                <th className="py-2 px-4 border">Vehicle Type</th>
                <th className="py-2 px-4 border">Fare</th>
                <th className="py-2 px-4 border">Start Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((ride, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4 border">{ride.rider_name}</td>
                  <td className="py-2 px-4 border">{ride.driver_name}</td>
                  <td className="py-2 px-4 border">{ride.source}</td>
                  <td className="py-2 px-4 border">{ride.destination}</td>
                  <td className="py-2 px-4 border">{ride.vehicle}</td>
                  <td className="py-2 px-4 border">${ride.fare}</td>
                  <td className="py-2 px-4 border">{new Date(ride.start_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'messages':
        return (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Rider Name</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Subject</th>
                <th className="py-2 px-4 border">Message</th>
                <th className="py-2 px-4 border">Received At</th>
              </tr>
            </thead>
            <tbody>
              {data.map((message, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4 border">{message.name}</td>
                  <td className="py-2 px-4 border">{message.email}</td>
                  <td className="py-2 px-4 border">{message.subject}</td>
                  <td className="py-2 px-4 border">{message.message}</td>
                  <td className="py-2 px-4 border">{new Date(message.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
  <DashboardHeader />
  
  {/* Main Content */}
  <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Tabs Navigation */}
    <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
      {['riders', 'drivers', 'rides', 'messages'].map((tab) => (
        <button
          key={tab}
          className={`px-6 gap-2.5 py-2 font-medium transition-colors duration-300 ${
            activeTab === tab 
              ? 'text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400' 
              : 'text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {['riders', 'drivers', 'rides', 'messages'].map((stat) => (
        <div 
          key={stat} 
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-gray-700 dark:text-gray-300 text-sm uppercase font-medium">
            {stat}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {activeTab === stat ? data.length : '--'}
          </p>
        </div>
      ))}
    </div>

    {/* Data Table Container */}
    <div className="bg-white text-gray-700 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {renderTable()}
    </div>
  </main>

  <Footer />
</div>

  );
};

export default AdminPage;