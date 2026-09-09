import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e8e1d5] bg-[#fffdf9] px-4 sm:px-6 lg:px-8 shadow-sm relative z-10">
      <div className="flex flex-1 items-center justify-end space-x-6">
        <div className="flex items-center space-x-2 text-sm text-[#26332d]">
          <User className="h-5 w-5 text-[#0e6b4f]" />
          <span className="font-semibold">{user?.name}</span>
          <span className="inline-flex items-center rounded-full bg-[#e6f2eb] px-2.5 py-1 text-xs font-bold text-[#0e6b4f] ring-1 ring-inset ring-[#b9d8c5] shadow-sm">
            {user?.role}
          </span>
        </div>
        
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-red-50 hover:ring-red-200 disabled:opacity-50 transition-modern"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
};
