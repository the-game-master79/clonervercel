import { supabase } from '../lib/supabase';
import { DEFAULT_USER_ID } from '../constants';
import type { CreateOrderRequest, ApiResponse } from '../types/api.types';

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_URL = import.meta.env.VITE_SUPABASE_URL; // Change back to Supabase URL

export const apiMiddleware = {
  headers: {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`
  },

  async handleCreateOrder(request: CreateOrderRequest): Promise<ApiResponse> {
    try {
      // Insert order with default user
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ 
          amount: request.amount,
          user_id: DEFAULT_USER_ID
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create associated payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_number: order.order_number,
          amount: request.amount,
          status: 'PENDING',
          method: 'UPI',
          user_id: DEFAULT_USER_ID,
          recipient_name: 'API Payment'
        });

      if (paymentError) {
        await supabase.from('orders').delete().eq('id', order.id);
        throw paymentError;
      }

      return {
        status: 'success',
        data: {
          order_number: order.order_number,
          amount: order.amount,
          expires_at: order.expires_at,
          payment_url: `${API_URL}/rest/v1/payments/${order.order_number}`,
          upi_id: order.upi_id
        }
      };

    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to create order'
      };
    }
  }
};
