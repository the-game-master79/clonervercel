import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PaymentIn from './pages/PaymentIn';
import PaymentOut from './pages/PaymentOut';
import AllDetails from './pages/AllDetails';
import Auth from './pages/Auth';
import API from './pages/API';
import Landing from './pages/Landing';
import ProcessingTransactions from './pages/ProcessingTransactions';
import DemoOrder from './pages/DemoOrder';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader } from 'lucide-react';

function ProtectedRoutes() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={session ? '/dashboard' : '/auth'} replace />}
      />
      <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/landing" element={<Landing />} />
      <Route element={session ? <Layout /> : <Navigate to="/auth" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment-in" element={<PaymentIn />} />
        <Route path="/payment-out" element={<PaymentOut />} />
        <Route path="/all-details" element={<AllDetails />} />
        <Route path="/api" element={<API />} />
        <Route path="/demo-order" element={<DemoOrder />} />
        <Route path="/processing-transactions" element={<ProcessingTransactions />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProtectedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;