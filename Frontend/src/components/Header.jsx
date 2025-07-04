import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <header className="header sticky top-0 z-50">
      <h1 className="text-[min(10vw,70px)] logo font font-sans font-extrabold">PickUpPal</h1>
      <nav>
        <ul className="nav-links flex gap-6 items-center">
          <li>
            <Link to="/" className="hover:text-white transition-colors duration-300">Home</Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-white transition-colors duration-300">Login</Link>
          </li>
          <li className="relative">
            <button 
              onClick={toggleDropdown}
              className="hover:text-white transition-colors duration-300 focus:outline-none"
            >
              Sign Up
            </button>
            {isDropdownOpen && (
              <ul 
                className="absolute left-0 mt-1 w-30 bg-[#5a8bb9] text-[#2b1986] rounded shadow-lg z-50 flex flex-col"
                onClick={closeDropdown}
              >
                <li>
                  <Link
                    to="/signup?role=rider"
                    className="block px-2 py-2 border-b hover:bg-[#aac8e3]"
                  >
                    Rider
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup?role=driver"
                    className="block px-2 py-2 border-b hover:bg-[#aac8e3]"
                  >
                    Driver
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup?role=admin"
                    className="block px-2 py-2 hover:bg-[#aac8e3]"
                  >
                    Admin
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;