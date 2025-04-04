import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard, 
  FileCode, 
  LogOut,
  PlusCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '@mui/material';

function Layout() {
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="h-full flex flex-col">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800">TransactPro</h1>
          </div>
          
          <nav className="flex-1 p-4">
            <Button
              variant="contained"
              startIcon={<PlusCircle size={20} />}
              onClick={() => navigate('/order')}
              sx={{
                width: '100%',
                mb: 2,
                textTransform: 'none',
                justifyContent: 'flex-start',
                pl: 2
              }}
            >
              Create New Order
            </Button>

            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg mt-2 ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <ArrowLeftRight size={20} />
              <span>Transactions</span>
            </NavLink>

            {/* Temporarily hidden Payouts link
            <NavLink
              to="/payouts"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg mt-2 ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <ArrowDownToLine size={20} />
              <span>Payouts</span>
            </NavLink>
            */}

            <NavLink
              to="/payments"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg mt-2 ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <CreditCard size={20} />
              <span>Payments</span>
            </NavLink>

            <NavLink
              to="/api-docs"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg mt-2 ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <FileCode size={20} />
              <span>API Docs</span>
            </NavLink>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;