import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Utensils } from 'lucide-react';
import { Menu } from 'lucide-react';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout, isLoggingOut } = useAuth();

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
        <div className="flex flex-none items-center space-x-1.5 text-sm text-[#26332d] sm:space-x-2">
          <User className="h-5 w-5 text-[#0e6b4f]" />
          <span className="hidden sm:inline max-w-[120px] truncate font-semibold">{user?.name}</span>
          <span className="hidden md:inline-flex items-center rounded-full bg-[#e6f2eb] px-2.5 py-1 text-xs font-bold text-[#0e6b4f] ring-1 ring-inset ring-[#b9d8c5] shadow-sm">
            {user?.role}
          </span>
        </div>
        
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="flex flex-none items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-red-50 hover:ring-red-200 disabled:opacity-50 transition-modern sm:px-3.5"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );
};
