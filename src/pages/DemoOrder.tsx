import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';
import { Wallet } from 'lucide-react';

const DemoOrder: React.FC = () => {
  const navigate = useNavigate();

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
        type: 'IN', // Change to explicitly set type as 'IN'
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

      // Open in new tab instead of using navigate
      window.open(`/landing?order=${orderNumber}&expiresAt=${expirationTime.toISOString()}`, '_blank');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <Wallet className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Create Demo Order</h1>
          <p className="mt-2 text-gray-600">Generate a new payment order for testing</p>
        </div>
        
        <button
          onClick={handleCreateDemoOrder}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Create New Order
        </button>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default DemoOrder;
