import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Download, Filter } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Transaction {
  transaction_id: string;
  type: 'IN' | 'OUT';
  amount: number;
  method: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}

const AllDetails: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionType, setTransactionType] = useState('all');
  const [status, setStatus] = useState('all');
  const [rowsToShow, setRowsToShow] = useState(10); // State to track rows to display

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions_history')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
    };

    fetchTransactions();
  }, []);

  const handleExport = () => {
    // Export logic can be implemented here
    console.log('Exporting transactions...');
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesType = transactionType === 'all' || transaction.type === transactionType.toUpperCase();
      const matchesStatus = status === 'all' || transaction.status === status.toUpperCase();
      const matchesDate =
        (!dateRange.start || new Date(transaction.created_at) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(transaction.created_at) <= new Date(dateRange.end));
      return matchesType && matchesStatus && matchesDate;
    })
    .slice(0, rowsToShow); // Limit rows based on rowsToShow

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="h-5 w-5 mr-2" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All</option>
                <option value="in">Payment In</option>
                <option value="out">Payment Out</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.transaction_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{transaction.transaction_id.slice(0, 4)}...{transaction.transaction_id.slice(-4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(transaction.created_at), 'PP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'IN'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.type === 'IN' ? 'Payment In' : 'Payment Out'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{transaction.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rowsToShow < transactions.length && (
        <button
          onClick={() => setRowsToShow(rowsToShow + 10)} // Increment rowsToShow by 10
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default AllDetails;