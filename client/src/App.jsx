import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Staff from './pages/Staff';
import Shifts from './pages/Shifts';
import Swaps from './pages/Swaps';
import Leave from './pages/Leave';
import Compliance from './pages/Compliance';
import Login from './pages/Login';
import Calendar from './pages/Calendar';
import OpenShifts from './pages/OpenShifts';

// Staff Pages
import StaffDashboard from './pages/StaffDashboard';
import StaffLeave from './pages/StaffLeave';
import StaffCompliance from './pages/StaffCompliance';
import StaffSwaps from './pages/StaffSwaps';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'STAFF';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        {/* Conditional Index Route */}
        <Route index element={isStaff ? <StaffDashboard /> : <Dashboard />} />
        
        {/* Admin/Manager Routes */}
        <Route path="calendar" element={<Calendar />} />
        <Route path="staff" element={<Staff />} />
        <Route path="shifts" element={<Shifts />} />
        <Route path="swaps" element={<Swaps />} />
        <Route path="leave" element={<Leave />} />
        <Route path="compliance" element={<Compliance />} />

        {/* Staff Specific Routes */}
        <Route path="my-leave" element={<StaffLeave />} />
        <Route path="my-compliance" element={<StaffCompliance />} />
        <Route path="open-shifts" element={<OpenShifts />} />
        <Route path="my-swaps" element={<StaffSwaps />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
