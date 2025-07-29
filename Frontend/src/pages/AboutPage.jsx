import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const AboutUsPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <div className="bg-[#e3e7f7] dark:bg-[#1f2533] min-h-screen transition-colors duration-500">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            >
              About Pickup Pal
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl max-w-3xl mx-auto"
            >
              Revolutionizing urban mobility with safe, reliable, and affordable
              rides
            </motion.p>
          </div>
        </div>

        {/* Our Story */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Pickup Pal began in 2025 as a Level 2, Term 1 database
                management project, developed by a me and my friend eager
                to bridge the gap between riders and drivers in a more
                structured and efficient way. What started as a classroom idea
                quickly evolved into a fully functional prototype.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Though still in its early stages, Pickup Pal showcases our
                passion for solving real-world problems with technology. Our
                goal is to create a reliable platform that demonstrates solid
                database design, intuitive user experience, and practical
                application of what we’ve learned.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-[#c1d2e7] dark:bg-[#334155] rounded-xl p-6 shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="Team working together"
                className="rounded-lg w-full h-auto"
              />
            </motion.div>
          </div>
        </div>

        {/* Our Mission */}
        <div className="bg-[#c1d2e7] dark:bg-[#334155] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-12"
            >
              Our Mission
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🚗",
                  title: "Reliable Rides",
                  description:
                    "Providing dependable transportation whenever you need it, with real-time tracking and ETAs",
                },
                {
                  icon: "💵",
                  title: "Affordable Pricing",
                  description:
                    "Competitive rates with transparent pricing and no surprise fees",
                },
                {
                  icon: "🛡️",
                  title: "Safe Travel",
                  description:
                    "Rigorous driver screening and 24/7 support to ensure your safety",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-[#1f2533] p-8 rounded-xl shadow-md"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12"
          >
            Why Choose Pickup Pal?
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Multiple Vehicle Options",
                description:
                  "Choose from cars, motorcycles, or CNGs based on your needs and budget",
              },
              {
                title: "Instant Booking",
                description:
                  "Get matched with a driver in seconds with our advanced dispatch system",
              },
              {
                title: "Cashless Payments",
                description:
                  "Secure in-app payments with multiple payment method options",
              },
              {
                title: "Ride Sharing",
                description:
                  "Save money by sharing your ride with others going the same way",
              },
              {
                title: "24/7 Availability",
                description:
                  "Service available round the clock, whenever you need a ride",
              },
              {
                title: "Eco-Friendly Options",
                description:
                  "Choose electric vehicles to reduce your carbon footprint",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#c1d2e7] dark:bg-[#334155] p-6 rounded-lg shadow-sm"
              >
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-[#c1d2e7] dark:bg-[#334155] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12"
            >
              Meet The Team
            </motion.h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[
                {
                  name: 'Rabiul Hasan Reza ',
                  role: 'Founder',
                  image: 'https://randomuser.me/api/portraits/men/32.jpg'
                },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-[#1f2533] rounded-xl overflow-hidden shadow-lg text-center"
                >
                  <img 
                    src={'reza.jpg'} 
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{member.name}</h3>
                    <p className="text-blue-600 dark:text-blue-400">{member.role}</p>
                  </div>
                </motion.div>
              ))}
              {[
                {
                  name: 'Solaiman Seyam',
                  role: 'Founder',
                  image: 'https://randomuser.me/api/portraits/men/32.jpg'
                },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-[#1f2533] rounded-xl overflow-hidden shadow-lg text-center"
                >
                  <img 
                    src={'seyam.jpg'} 
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{member.name}</h3>
                    <p className="text-blue-600 dark:text-blue-400">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 sm:p-12 shadow-xl"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Ready to ride with us?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied riders and drivers who are already
              enjoying the Pickup Pal experience.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/signup?role=driver")}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition duration-300"
              >
                Become a Driver
              </button>

              <button
                onClick={() => navigate("/signup?role=rider")}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition duration-300"
              >
                Become a Rider
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUsPage;
