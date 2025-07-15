import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SignUpPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const role = query.get('role') || 'rider'; // Default to rider if no role specified
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirm } = formData;

    // Client-side validation
    if (!name || !email || !phone || !password || !confirm) {
      setError('All fields are required');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let endpoint = '/api/signup/rider';
      let body = { name, email, phone, password };

      if (role === 'driver') {
        endpoint = '/api/signup/driver';
        // Add required driver fields
        body = {
          ...body,
          license_num: 'DRIVER' + Math.floor(Math.random() * 10000), // Generate random license number
          model: 'Toyota Corolla',
          license_plate: 'DHA-' + Math.floor(Math.random() * 1000),
          capacity: '4',
          color: 'White'
        };
      }

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Save user data and token to localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      // Redirect based on role
      // In the handleSignup function, change the navigate line to:
       navigate(role === 'driver' ? '/driversignup' : '/login');

    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
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
            {role === 'driver' ? 'Become a Driver' : 'Create a Rider Account'}
          </h2>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+880XXXXXXXXXX"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                Password (min 6 characters)
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Create a password"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirm"
                type="password"
                value={formData.confirm}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-base transition duration-300 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing up...
                </span>
              ) : 'Sign Up'}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default SignUpPage;