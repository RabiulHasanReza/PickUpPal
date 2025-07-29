import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaCar, FaHeadset, FaShieldAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-teal-500 to-[#65c4e7] dark:bg-[#5a8bb9] text-white py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center">
              <FaCar className="text-3xl mr-3" />
              <h3 className="text-2xl font-bold">PickUpPal</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              Revolutionizing urban mobility with safe, reliable, and affordable transportation solutions for everyone.
            </p>
            <div className="flex space-x-5">
              <a 
                href="#" 
                className="hover:text-[#aac8e3] transition-colors transform hover:scale-110"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a 
                href="#" 
                className="hover:text-[#aac8e3] transition-colors transform hover:scale-110"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a 
                href="#" 
                className="hover:text-[#aac8e3] transition-colors transform hover:scale-110"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a 
                href="#" 
                className="hover:text-[#aac8e3] transition-colors transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-5 flex items-center">
              <span className="w-1 h-6 bg-[#aac8e3] mr-3"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="hover:text-[#cfd4da] transition-colors text-sm flex items-center group"
                >
                  <span className="w-2 h-2 bg-[#aac8e3] rounded-full mr-2 group-hover:animate-pulse"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#aac8e3] transition-colors text-sm flex items-center group"
                >
                  <span className="w-2 h-2 bg-[#aac8e3] rounded-full mr-2 group-hover:animate-pulse"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/signup?role=driver"
                  className="hover:text-[#aac8e3] transition-colors text-sm flex items-center group"
                >
                  <span className="w-2 h-2 bg-[#aac8e3] rounded-full mr-2 group-hover:animate-pulse"></span>
                  Become a Driver
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-5 flex items-center">
              <span className="w-1 h-6 bg-[#aac8e3] mr-3"></span>
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help"
                  className="hover:text-[#aac8e3] transition-colors text-sm flex items-center group"
                >
                  <FaHeadset className="mr-2 text-[#aac8e3] group-hover:animate-bounce" size={14} />
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-[#aac8e3] transition-colors text-sm flex items-center group"
                >
                  <FaShieldAlt className="mr-2 text-[#aac8e3] group-hover:animate-pulse" size={14} />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Badges */}
          <div className="space-y-5">
            <h4 className="text-lg font-semibold flex items-center">
              <span className="w-1 h-6 bg-[#aac8e3] mr-3"></span>
              Our Commitment
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🚀</div>
                <p className="text-xs font-medium">Fast Service</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🛡️</div>
                <p className="text-xs font-medium">Safe Rides</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">💲</div>
                <p className="text-xs font-medium">Fair Pricing</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🌟</div>
                <p className="text-xs font-medium">5-Star Service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-10 pt-8 text-center">
          <p className="text-sm opacity-90">
            © {new Date().getFullYear()} PickUpPal Technologies. All rights reserved.
          </p>
          <p className="text-xs opacity-70 mt-2">
            Making your journeys smoother, one ride at a time.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;