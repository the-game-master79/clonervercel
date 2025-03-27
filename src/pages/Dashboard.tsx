import React, { useEffect, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Activity } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [activeMethods, setActiveMethods] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<{ transaction_id: string; type: string; created_at: string; amount: number }[]>([]);
  const [activePaymentMethods, setActivePaymentMethods] = useState<{ id: string; type: string; status: boolean }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch total income
      const { data: incomeData, error: incomeError } = await supabase
        .from('transactions_history')
        .select('amount')
        .eq('type', 'IN')
        .eq('status', 'COMPLETED');
      if (!incomeError) {
        setTotalIncome(incomeData.reduce((sum, transaction) => sum + transaction.amount, 0));
      }

      // Fetch total expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from('transactions_history')
        .select('amount')
        .eq('type', 'OUT')
        .eq('status', 'COMPLETED');
      if (!expenseError) {
        setTotalExpenses(expenseData.reduce((sum, transaction) => sum + transaction.amount, 0));
      }

      // Fetch active methods
      const { data: methodsData, error: methodsError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('status', true);
      if (!methodsError) {
        setActiveMethods(methodsData.length);
      }

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (!transactionsError) {
        setRecentTransactions(transactionsData || []);
      }

      // Fetch active payment methods
      const { data: activeMethodsData, error: activeMethodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('status', true)
        .limit(3);
      if (!activeMethodsError) {
        setActivePaymentMethods(activeMethodsData || []);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
            </div>
            <ArrowUpCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <ArrowDownCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Methods</p>
              <p className="text-2xl font-bold text-indigo-600">{activeMethods}</p>
            </div>
            <Activity className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.transaction_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {transaction.type === 'IN' ? (
                    <ArrowUpCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type === 'IN' ? 'Payment Received' : 'Payment Sent'}
                    </p>
                    <p className="text-sm text-gray-600">{format(new Date(transaction.created_at), 'PP')}</p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'IN' ? `+₹${transaction.amount}` : `-₹${transaction.amount}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {activePaymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">{method.type[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{method.type}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;