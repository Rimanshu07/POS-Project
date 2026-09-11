import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LOGIN_ROUTE } from './routePaths';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading application...</div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to={LOGIN_ROUTE} replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to a default safe route based on their role
    if (user.role === 'CASHIER') {
      return <Navigate to="/pos" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
