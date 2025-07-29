import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import { FaMoneyBillWave, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DriverEarningsPage = () => {
  const [user, setUser] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    history: [],
  });
  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login/driver");
      return;
    }
    setUser(loggedInUser);

    const fetchEarnings = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/driver/earnings?driver_id=${loggedInUser.id}&range=${timeRange}`
        );
        if (response.ok) {
          const data = await response.json();
          setEarnings(data);
        }
      } catch (error) {
        console.error("Failed to fetch earnings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, [navigate, timeRange]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price) => {
    return `$${price?.toFixed(2) || "0.00"}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                <FaMoneyBillWave className="inline mr-2" />
                Earnings
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
                  Loading earnings data...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <h3 className="text-sm text-blue-600 dark:text-blue-300 mb-1">
                      Today
                    </h3>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">
                      {formatPrice(earnings.today)}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                    <h3 className="text-sm text-green-600 dark:text-green-300 mb-1">
                      This Week
                    </h3>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-100">
                      {formatPrice(earnings.week)}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                    <h3 className="text-sm text-purple-600 dark:text-purple-300 mb-1">
                      This Month
                    </h3>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-100">
                      {formatPrice(earnings.month)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                    <h3 className="text-sm text-yellow-600 dark:text-yellow-300 mb-1">
                      Total
                    </h3>
                    <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-100">
                      {formatPrice(earnings.total)}
                    </p>
                  </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Earnings History
                  </h2>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                {/* Earnings Chart (Placeholder) */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg h-64 flex items-center justify-center">
                  <FaChartLine className="text-4xl text-gray-400 dark:text-gray-500" />
                  <p className="ml-3 text-gray-500 dark:text-gray-400">
                    Earnings chart would be displayed here
                  </p>
                </div>

                {/* Earnings History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Recent Transactions
                  </h3>
                  {earnings.history.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Ride ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {earnings.history.map((transaction) => (
                            <tr
                              key={transaction.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                #{transaction.ride_id}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                {formatPrice(transaction.amount)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    transaction.status === "completed"
                                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                  }`}
                                >
                                  {transaction.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-300">
                        No transactions found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DriverEarningsPage;