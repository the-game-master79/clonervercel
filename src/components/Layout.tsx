import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowRightCircle, List, LogOut, Wallet, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleCreateDemoOrder = async () => {
    try {
      const { data: paymentMethod, error: paymentMethodError } = await supabase
        .from('payment_methods')
        .select('id, type, time_limit')
        .eq('status', true)
        .neq('type', 'DEMO')
        .limit(1)
        .single();

      if (paymentMethodError) {
        console.error('Error fetching payment method:', paymentMethodError.message);
        alert('Error fetching payment method. Please try again.');
        return;
      }

      if (!paymentMethod) {
        alert('No active payment methods available. Please add a valid payment method (UPI, CRYPTO, or BANK).');
        return;
      }

      const orderNumber = uuidv4();
      const now = new Date();
      const expirationTime = new Date(now.getTime() + (paymentMethod.time_limit * 60 * 1000));

      const newTransaction = {
        transaction_id: orderNumber,
        type: 'IN', // Change this to explicitly set type as 'IN'
        amount: 0,
        method: paymentMethod.type,
        status: 'PENDING',
        created_at: now.toISOString(),
        expires_at: expirationTime.toISOString(),
      };

      const { error } = await supabase
        .from('transactions_history')
        .insert([newTransaction]);

      if (error) {
        throw error;
      }

      // Open in new tab instead of navigating
      window.open(`/landing?order=${orderNumber}&expiresAt=${expirationTime.toISOString()}`, '_blank');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <Wallet className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">PayTracker</span>
          </div>
          <nav className="space-y-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/payment-in"
              className={({ isActive }) =>
                `flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <ArrowRightCircle className="h-5 w-5" />
              <span>Payment In</span>
            </NavLink>
            <NavLink
              to="/all-details"
              className={({ isActive }) =>
                `flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <List className="h-5 w-5" />
              <span>All Details</span>
            </NavLink>
            {/* Hide Payment Out and API */}
            {/* <NavLink to="/payment-out" ... /> */}
            {/* <NavLink to="/api" ... /> */}
          </nav>
          
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-600">Processing Transactions</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <NavLink
                  to="/processing-transactions"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <List className="h-5 w-5" />
                  <span>Processing</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreateDemoOrder}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>Create Demo Order</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;