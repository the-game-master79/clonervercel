import React, { useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Payments from './pages/Payments';
import ApiDocs from './pages/ApiDocs';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Order from './pages/Order';
import NotFound from './pages/NotFound';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, initialized } = useAuthStore(state => ({
    user: state.user,
    loading: state.loading,
    initialized: state.initialized
  }));

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <Router future={{ v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            user ? <Navigate to="/" /> : <Login />
          } />
          <Route path="/reset-password" element={
            user ? <Navigate to="/" /> : <ResetPassword />
          } />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="payments" element={<Payments />} />
            <Route path="api-docs" element={<ApiDocs />} />
          </Route>

          {/* Protected standalone route */}
          <Route path="/order" element={
            <ProtectedRoute>
              <Order />
            </ProtectedRoute>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;