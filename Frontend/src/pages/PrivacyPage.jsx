import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const PrivacyPolicyPage = () => {
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
              Privacy Policy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl max-w-3xl mx-auto"
            >
              Your privacy is important to us
            </motion.p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-[#334155] rounded-xl shadow-lg p-8 sm:p-10"
          >
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Effective Date: January 1, 2023
              </h2>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                1. Information We Collect
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We collect information to provide better services to all our
                users. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                <li>
                  <strong>Personal Information:</strong> Name, email address,
                  phone number, payment information
                </li>
                <li>
                  <strong>Location Data:</strong> Precise location when you use
                  our services
                </li>
                <li>
                  <strong>Usage Data:</strong> How you interact with our
                  services
                </li>
                <li>
                  <strong>Device Information:</strong> Device type, operating
                  system, browser type
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                2. How We Use Your Information
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send transaction notifications</li>
                <li>Personalize your experience</li>
                <li>Analyze how our services are used</li>
                <li>
                  Communicate with you about products, services, and promotions
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                3. Information Sharing
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We do not share your personal information with companies,
                organizations, or individuals outside of Pickup Pal except in
                the following cases:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                <li>With your consent</li>
                <li>
                  For external processing by our trusted service providers
                </li>
                <li>
                  For legal reasons when we believe disclosure is required
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                4. Data Security
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We implement appropriate security measures to protect against
                unauthorized access, alteration, disclosure, or destruction of
                your personal information.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                5. Your Choices
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">You can:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                <li>Review and update your account information</li>
                <li>Opt-out of promotional communications</li>
                <li>Disable location services through your device settings</li>
                <li>Request deletion of your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                6. Changes to This Policy
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                7. Contact Us
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Email: privacy@pickuppal.com
                <br />
                Address: 123 Mobility Lane, Tech City, TC 12345
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 sm:p-12 shadow-xl"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Questions About Our Policies?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Our support team is here to help with any questions you may have
              about your data and privacy.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => {
                  navigate("/help");
                  // This timeout ensures the page has loaded before scrolling
                  setTimeout(() => {
                    const contactSection =
                      document.getElementById("contact-support");
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition duration-300"
              >
                Contact Support
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition duration-300"
              >
                Return Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;
