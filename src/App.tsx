import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PaymentIn from './pages/PaymentIn';
import PaymentOut from './pages/PaymentOut';
import AllDetails from './pages/AllDetails';
import Auth from './pages/Auth';
import API from './pages/API';
import Landing from './pages/Landing'; // Import the Landing page
import ProcessingTransactions from './pages/ProcessingTransactions';
import { useEffect, useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('session');
    setIsAuthenticated(!!session);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/auth'} replace />}
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/landing" element={<Landing />} /> {/* Move this route outside Layout */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/auth" replace />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment-in" element={<PaymentIn />} />
          <Route path="/payment-out" element={<PaymentOut />} />
          <Route path="/all-details" element={<AllDetails />} />
          <Route path="/api" element={<API />} />
          <Route path="/processing-transactions" element={<ProcessingTransactions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;