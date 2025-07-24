import React, { useState, useEffect } from "react";
import { FaGlobe, FaQuestionCircle, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function DashboardHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (storedUser) {
      setUser(storedUser);
    }
    
  }, []);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#87b2dc] text-white shadow-md">
        <div className="max-w-screen-xl mx-auto flex flex-wrap justify-between items-center px-4 py-3">
          <h1 className="text-xl font-extrabold font-sans">PickUpPal</h1>

          <nav className="flex items-center gap-4 mt-3 sm:mt-0 flex-wrap">
            {/* Language */}
            {/* <div className="flex items-center gap-1 cursor-pointer hover:text-gray-200 text-sm">
              <FaGlobe />
              <span>EN</span>
            </div> */}

            {/* Help */}
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-200 text-sm">
              <FaQuestionCircle />
              <span onClick={() => navigate("/help")}>Help</span>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 bg-[#334155] px-3 py-1.5 rounded-full text-sm hover:bg-[#2b3a4c] transition"
              >
                <FaUserCircle />
                <span className="truncate max-w-[100px]">
                  {user?.name || "User"}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 rounded shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      localStorage.removeItem("loggedInUser");
                      window.location.href = "/login";
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                  <button
                    onClick={() => {
                      if (user.role?.toLowerCase() === "driver") {
                        navigate("/driver/settings");
                      } else {
                        navigate("/rider/settings");
                      }
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Account
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Welcome Bar */}
      {user && (
        <div className="bg-[#5a8bb9] text-white text-sm px-4 py-2 shadow-sm text-center sm:text-left">
          Welcome back, <span className="font-semibold">{user.name}</span>!{" "}
          {user.role?.toLowerCase() === "rider"
            ? "Wanna go somewhere?"
            : "Wanna pick someone up?"}
        </div>
      )}
    </>
  );
}

export default DashboardHeader;
