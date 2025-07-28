import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-teal-500 to-[#65c4e7] dark:bg-[#5a8bb9] text-white py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center">
              <span className="text-2xl mr-2">🚗</span>
              PickUpPal
            </h3>
            <p className="text-sm opacity-80">
              Connecting riders and drivers for seamless urban transportation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#aac8e3] transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="hover:text-[#aac8e3] transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:text-[#aac8e3] transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="hover:text-[#aac8e3] transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="hover:text-[#cfd4da] transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#aac8e3] transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/signup?role=driver"
                  className="hover:text-[#aac8e3] transition-colors text-sm"
                >
                  Become a Driver
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help#contact-support"
                  className="hover:text-[#aac8e3] transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy"
                  className="hover:text-[#aac8e3] transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-sm opacity-80 mb-3">
              Subscribe to get updates on new features and offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 text-sm text-gray-800 rounded-l focus:outline-none w-full"
              />
              <button className="bg-[#2b1986] hover:bg-[#1a104d] text-white px-4 py-2 rounded-r text-sm transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#aac8e3] mt-8 pt-6 text-center text-sm opacity-80">
          <p>© {new Date().getFullYear()} PickUpPal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
