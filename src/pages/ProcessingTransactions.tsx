import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface Transaction {
  transaction_id: string;
  type: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

const ProcessingTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchProcessingTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions_history')
        .select('*')
        .eq('status', 'PROCESSING'); // Fetch transactions with status 'PROCESSING'
      if (error) {
        console.error('Error fetching processing transactions:', error.message);
      } else {
        setTransactions(data || []);
      }
    };

    fetchProcessingTransactions();
  }, []);

  const handleApprove = async (transactionId: string) => {
    const { error } = await supabase
      .from('transactions_history')
      .update({ status: 'COMPLETED' })
      .eq('transaction_id', transactionId);

    if (error) {
      console.error('Error approving transaction:', error.message);
    } else {
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.transaction_id !== transactionId)
      );
    }
  };

  const handleReject = async (transactionId: string) => {
    const { error } = await supabase
      .from('transactions_history')
      .update({ status: 'FAILED' })
      .eq('transaction_id', transactionId);

    if (error) {
      console.error('Error rejecting transaction:', error.message);
    } else {
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.transaction_id !== transactionId)
      );
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Processing Transactions</h2>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
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
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.transaction_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.transaction_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{transaction.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleApprove(transaction.transaction_id)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(transaction.transaction_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessingTransactions;
