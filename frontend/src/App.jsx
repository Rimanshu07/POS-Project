import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { OrderHistory } from './pages/OrderHistory';
import { LOGIN_ROUTE } from './routes/routePaths';

function App() {
  return (
    <Routes>
      <Route path={LOGIN_ROUTE} element={<Login />} />

      {/* Protected Routes Wrapper */}
      <Route element={<AppLayout />}>
        
        {/* Dashboard: ADMIN, MANAGER */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
        </Route>

        {/* Orders: ADMIN, MANAGER, CASHIER */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']} />}>
          <Route path="/orders" element={<OrderHistory />} />
        </Route>

      </Route>

      {/* Full-screen POS Layout */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']} />}>
        <Route path="/pos" element={<POS />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
