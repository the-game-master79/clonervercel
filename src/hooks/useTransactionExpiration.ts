import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const useTransactionExpiration = (
  transactionId: string | null,
  expiresAt: string | null
) => {
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!transactionId || !expiresAt) return;

    const checkExpiration = async () => {
      const now = new Date();
      const expiration = new Date(expiresAt);
      const diff = expiration.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        
        // Update transaction status in Supabase
        const { error } = await supabase
          .from('transactions_history')
          .update({ status: 'EXPIRED' })
          .eq('transaction_id', transactionId)
          .eq('status', 'PENDING');

        if (error) {
          console.error('Error updating expired transaction:', error);
        }
        
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    // Initial check
    checkExpiration();

    // Set up interval to check every second
    const interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
  }, [transactionId, expiresAt]);

  return { isExpired, timeLeft };
};
