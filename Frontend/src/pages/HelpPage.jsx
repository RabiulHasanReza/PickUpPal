import { useState } from "react";
import DashboardHeader from "../components/DashBoardHeader";
import Footer from "../components/Footer";
import { FaQuestionCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HelpPage = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");

    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const faqCategories = [
    {
      id: "account",
      title: "Account & Profile",
      questions: [
        {
          id: "account-1",
          question: "How do I update my profile information?",
          answer: "You can update your profile information by going to the Settings page and editing your details in the Profile Information section. Don't forget to save your changes."
        },
        {
          id: "account-2",
          question: "What should I do if I forgot my password?",
          answer: "On the login page, click on 'Forgot Password' and follow the instructions to reset your password. You'll receive an email with a link to create a new password."
        },
        {
          id: "account-3",
          question: "How do I delete my account?",
          answer: "To delete your account, please contact our support team. Account deletion is permanent and will remove all your data from our system."
        }
      ]
    },
    {
      id: "rides",
      title: "Rides & Bookings",
      questions: [
        {
          id: "rides-1",
          question: "How do I request a ride?",
          answer: "On the dashboard, enter your pickup location and destination in the 'Quick Ride' section. You can use your current location or type an address. Once confirmed, tap 'Request Ride' to find available drivers."
        },
        {
          id: "rides-2",
          question: "How do I cancel a ride?",
          answer: "Open the ride details and select 'Cancel Ride'. Please note that cancellation fees may apply if you cancel after a driver has accepted your request."
        },
        {
          id: "rides-3",
          question: "What payment methods are accepted?",
          answer: "We accept all major credit cards, debit cards, and digital wallets. You can manage your payment methods in the Payments section of the app."
        },
        {
          id: "rides-4",
          question: "How do I rate my driver?",
          answer: "After your ride is completed, you'll receive a prompt to rate your driver. You can also rate past rides in your Ride History by selecting the specific ride."
        }
      ]
    },
    {
      id: "payments",
      title: "Payments & Pricing",
      questions: [
        {
          id: "payments-1",
          question: "How are fares calculated?",
          answer: "Fares are based on distance, time, and demand. You'll see an estimated fare before confirming your ride. Final fare may vary slightly based on actual route and traffic conditions."
        },
        {
          id: "payments-2",
          question: "What if I was charged incorrectly?",
          answer: "If you believe there's an error in your fare, please contact support with your ride details and we'll investigate the issue."
        },
        {
          id: "payments-3",
          question: "How do I add a promo code?",
          answer: "You can apply promo codes in the payment section before confirming your ride. Valid codes will be automatically applied to your fare."
        }
      ]
    },
    {
      id: "driver",
      title: "Driver Questions",
      questions: [
        {
          id: "driver-1",
          question: "How do I become a driver?",
          answer: "Visit our website and complete the driver application. You'll need to provide documentation, pass a background check, and meet vehicle requirements."
        },
        {
          id: "driver-2",
          question: "When do I get paid?",
          answer: "Earnings are transferred weekly to your linked bank account. You can track your earnings in the Earnings section of your driver dashboard."
        },
        {
          id: "driver-3",
          question: "How do I update my vehicle information?",
          answer: "Go to Settings > Vehicle Information in your driver dashboard. Make sure all information is accurate and up-to-date."
        },
        {
          id: "driver-4",
          question: "What should I do if I have a problem with a rider?",
          answer: "For non-emergency issues, you can report the rider through the app. For emergencies, contact local authorities immediately."
        }
      ]
    },
    {
      id: "safety",
      title: "Safety & Security",
      questions: [
        {
          id: "safety-1",
          question: "What safety features does the app provide?",
          answer: "We offer features like ride tracking, emergency assistance, and driver/rider verification. All rides are GPS-tracked for your safety."
        },
        {
          id: "safety-2",
          question: "How do I verify my driver/rider?",
          answer: "Check the driver/rider details in the app before your ride. The app will show you their name, photo, and vehicle details (for drivers)."
        },
        {
          id: "safety-3",
          question: "What should I do in an emergency?",
          answer: "Use the emergency button in the app to alert authorities and share your location. For immediate danger, call local emergency services first."
        }
      ]
    }
  ];

  const toggleCategory = (categoryId) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
    setActiveQuestion(null);
  };

  const toggleQuestion = (questionId) => {
    setActiveQuestion(activeQuestion === questionId ? null : questionId);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Get rider_id from localStorage or wherever it's stored in your app
      // const rider_id = localStorage.getItem("user_id"); // Adjust this based on your auth system
      
      // if (!rider_id) {
      //   throw new Error("User not authenticated");
      // }

      const response = await axios.post("/api/rider/help", {
        ...formData
      });

      if (response.data.message) {
        setSubmitStatus('success');
        // Reset form on successful submission
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      }
    } catch (error) {
      console.error("Error submitting help request:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
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
        {isDark ? "🌞" : "🌙"}
      </button>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <FaQuestionCircle className="text-blue-600 dark:text-blue-300 text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Help Center</h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Find answers to common questions or contact our support team for assistance.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search help articles..."
                  className="w-full px-4 py-3 pl-12 border text-gray-800  dark:text-white border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaQuestionCircle className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-4 mb-12">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Frequently Asked Questions</h2>
              
              {faqCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="font-medium text-gray-800 dark:text-white">{category.title}</h3>
                    {activeCategory === category.id ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  
                  {activeCategory === category.id && (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {category.questions.map((item) => (
                        <div key={item.id} className="p-4">
                          <button
                            onClick={() => toggleQuestion(item.id)}
                            className="w-full flex justify-between items-center text-left"
                          >
                            <h4 className="font-medium text-gray-800 dark:text-white">{item.question}</h4>
                            {activeQuestion === item.id ? (
                              <FaChevronUp className="text-gray-500 dark:text-gray-400 ml-2" />
                            ) : (
                              <FaChevronDown className="text-gray-500 dark:text-gray-400 ml-2" />
                            )}
                          </button>
                          {activeQuestion === item.id && (
                            <p className="mt-2 text-gray-600 dark:text-gray-300">{item.answer}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Contact Support</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Can't find what you're looking for? Our support team is available 24/7 to help with any questions or issues.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                      <FaPhone className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Phone</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">01610279114</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">24/7 support</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                      <FaEnvelope className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Email</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">pikachud110@gmail.com</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Typically responds within 1 hour</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                      <FaMapMarkerAlt className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Headquarters</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">BUET,DHAKA,BANGLADESH</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open SAT-THU, 9AM-5PM</p>
                </div>
              </div>
            </div>

            {/* Help Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Send us a message</h2>
              
              {/* Submission status messages */}
              {submitStatus === 'success' && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                  Failed to send message. Please try again later.
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a topic</option>
                    <option value="account">Account Issues</option>
                    <option value="payment">Payment Problem</option>
                    <option value="ride">Ride Experience</option>
                    <option value="driver">Driver Concern</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    id="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your issue..."
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpPage;