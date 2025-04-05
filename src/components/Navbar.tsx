import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Redirect to login page after logout
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white text-xl font-bold">
              SafetyApp
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              {user && ( // Show only if logged in
                <>
                  <Link to="/submit" className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Submit Suggestion
                  </Link>
                  <Link to="/my-submissions" className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    My Submissions
                  </Link>
                  {user.role === 'admin' && ( // Show only if admin
                    <Link to="/admin" className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right side: User Info / Login / Logout */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <>
                  <span className="text-gray-300 text-sm mr-3">
                    Welcome, {user.username}! ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button (optional - can add later) */}
          {/* <div className="-mr-2 flex md:hidden"> ... </div> */}
        </div>
      </div>

      {/* Mobile menu (optional - can add later) */}
      {/* <div className="md:hidden"> ... </div> */}
    </nav>
  );
}

export default Navbar;
