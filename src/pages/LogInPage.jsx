import { useState, useEffect } from 'react'; 
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LoginPage = () => {
  
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (e) => {
    e.preventDefault();
    
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = existingUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      if(user.role=='rider' || user.role==null)
        window.location.href = '/dashboard';
      else if(user.role=='driver')
        window.location.href = '/driverdashboard';
      else if(user.role=='admin')
        window.location.href = '/driverdashboard';
    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <>
      <Header />
      <div className="bg-[#e3e7f7] dark:bg-[#1f2533] min-h-screen w-full flex items-center justify-center transition-colors duration-1500 px-4 sm:px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#c1d2e7] dark:bg-[#334155] rounded-xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-gray-800 dark:text-white mb-6">
            Log in to PickUpPal
          </h2>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5 md:space-y-6">
            <div>
              <label className="block mb-1 text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm sm:text-base border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm sm:text-base border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm sm:text-base md:text-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Log In
            </button>
          </form>
          
          {/* Additional responsive links */}
          <div className="mt-4 sm:mt-6 text-center">
            <a href="/forgot-password" className="text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:underline">
              Forgot password?
            </a>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a href="/signup?role=rider" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;