import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Utensils, Menu, ChevronDown } from 'lucide-react';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout, isLoggingOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-16 min-w-0 shrink-0 items-center border-b border-[#e8e1d5] bg-[#fffdf9] px-2 sm:px-6 lg:px-8 shadow-sm relative z-10">
      <button
        onClick={onMenuClick}
        className="flex-none rounded-lg p-2 text-[#0e6b4f] hover:bg-[#e6f2eb] lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 pl-1 sm:justify-end sm:space-x-6">
        <div className="flex min-w-0 items-center gap-2 text-[#0e6b4f] lg:hidden">
          <Utensils className="h-4 w-4 flex-none" />
          <span className="truncate text-sm font-bold restaurant-heading">Sherwoods POS</span>
        </div>
        {/* User pill with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex flex-none items-center space-x-1.5 text-sm text-[#26332d] sm:space-x-2 p-1 rounded hover:bg-gray-50 focus:outline-none transition-colors"
          >
            <User className="h-5 w-5 text-[#0e6b4f]" />
            <span className="hidden sm:inline max-w-[120px] truncate font-semibold">{user?.name}</span>
            <span className="hidden md:inline-flex items-center rounded-full bg-[#e6f2eb] px-2.5 py-1 text-xs font-bold text-[#0e6b4f] ring-1 ring-inset ring-[#b9d8c5] shadow-sm">
              {user?.role}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
