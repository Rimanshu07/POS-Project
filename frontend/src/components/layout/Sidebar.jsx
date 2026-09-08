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
    { name: 'All Sales', href: '/orders', icon: ShoppingBag, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { name: 'User Management', href: '/users', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  ];

  const allowedNav = navigation.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm transition-modern">
      {/* Sidebar Logo Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
        <NavLink to="/dashboard" className="text-xl font-bold text-indigo-600 tracking-wide hover:text-indigo-700 transition-colors">
          <span className="bg-indigo-600 text-white p-1.5 rounded-lg mr-2 text-sm shadow-sm">P1</span>
          {user?.role === 'ADMIN' ? 'Admin Panel' : 'Staff Portal'}
        </NavLink>
      </div>
      
      {/* Sidebar Links */}
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1.5 px-4">
          {allowedNav.map((item) => {
            const isActivePath = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  isActivePath
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm border-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium border-transparent',
                  'group flex items-center px-3 py-2.5 text-sm rounded-lg transition-modern border'
                )}
              >
                <item.icon 
                  className={clsx(
                    isActivePath ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500',
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
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 text-indigo-700 font-bold shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin User'}</p>
            <p className="text-xs font-medium text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
