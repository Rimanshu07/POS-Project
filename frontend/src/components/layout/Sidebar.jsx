import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  MonitorSmartphone, 
  Package, 
  Tags, 
  BarChart3, 
  Users,
  ShoppingBag
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Using exact icons and names that map to the PHP legacy UI as requested
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['ADMIN', 'MANAGER'] },
    { name: 'POS', href: '/pos', icon: MonitorSmartphone, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Category Management', href: '/categories', icon: Tags, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Sales & Report', href: '/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    // { name: 'All Sales', href: '/orders', icon: ShoppingBag, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { name: 'User Management', href: '/users', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  ];

  const allowedNav = navigation.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-full w-64 flex-col bg-[#163b2d] border-r border-[#285743] shadow-xl transition-modern">
      {/* Sidebar Logo Header */}
      <div className="flex h-20 shrink-0 items-center px-5 border-b border-[#285743]">
        <NavLink to="/dashboard" className="flex items-center text-white tracking-wide hover:text-[#f2c879] transition-colors">
          <span className="bg-[#f2c879] text-[#163b2d] p-2 rounded-xl mr-3 text-sm font-bold shadow-sm">S</span>
          <span>
            <span className="block text-lg font-bold restaurant-heading">Sherwoods</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#b9d0c2]">Restaurant POS</span>
          </span>
        </NavLink>
      </div>
      
      {/* Sidebar Links */}
      <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
        <nav className="flex-1 space-y-1.5 px-4">
          {allowedNav.map((item) => {
            const isActivePath = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  isActivePath
                    ? 'bg-[#f2c879] text-[#163b2d] font-semibold shadow-sm border-[#f2c879]'
                    : 'text-[#d5e4da] hover:bg-[#285743] hover:text-white font-medium border-transparent',
                  'group flex items-center px-3 py-3 text-sm rounded-xl transition-modern border'
                )}
              >
                <item.icon 
                  className={clsx(
                    isActivePath ? 'text-[#163b2d]' : 'text-[#9bb9a8] group-hover:text-white',
                    'mr-3 h-5 w-5 flex-shrink-0 transition-modern'
                  )} 
                  aria-hidden="true" 
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      {/* Sidebar Footer */}
      <div className="px-5 py-4 border-t border-[#285743] bg-[#102f24]">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-[#f2c879] flex items-center justify-center border border-[#f7dda3] text-[#163b2d] font-bold shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-white">{user?.name || 'Admin User'}</p>
            <p className="text-xs font-medium text-[#b9d0c2]">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
