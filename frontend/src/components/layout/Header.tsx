import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navigateTo = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">ExpenseTracker</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => navigate("/dashboard")}
              className={`${
                isActive("/dashboard")
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/transactions")}
              className={`${
                isActive("/transactions")
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              Transactions
            </button>
            <button
              onClick={() => navigate("/categories")}
              className={`${
                isActive("/categories")
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              Categories
            </button>
            <button
              onClick={() => navigate("/charts")}
              className={`${
                isActive("/charts")
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              Charts
            </button>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-gray-50 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                // Hamburger icon
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                // Close icon
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-25 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Mobile menu content */}
          <div className="md:hidden relative z-30 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
              {/* Navigation Links */}
              <button
                onClick={() => navigateTo("/dashboard")}
                className={`${
                  isActive("/dashboard")
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                } block px-3 py-2 text-base font-medium border-l-4 transition-colors w-full text-left`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigateTo("/transactions")}
                className={`${
                  isActive("/transactions")
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                } block px-3 py-2 text-base font-medium border-l-4 transition-colors w-full text-left`}
              >
                Transactions
              </button>
              <button
                onClick={() => navigateTo("/categories")}
                className={`${
                  isActive("/categories")
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                } block px-3 py-2 text-base font-medium border-l-4 transition-colors w-full text-left`}
              >
                Categories
              </button>
              <button
                onClick={() => navigateTo("/charts")}
                className={`${
                  isActive("/charts")
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                } block px-3 py-2 text-base font-medium border-l-4 transition-colors w-full text-left`}
              >
                Charts
              </button>
            </div>

            {/* User info and logout */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
