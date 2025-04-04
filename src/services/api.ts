import { supabase } from '../lib/supabase';
import { authMiddleware } from './authMiddleware';
import { apiRoutes } from './apiRoutes';
import { ordersService } from './orders';  // Add this import
import { apiMiddleware } from './apiMiddleware';
import { API_BASE_URL } from '../constants';
import type { CreateOrderRequest, ApiResponse, GetStatusResponse } from '../types/api.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Add default user ID constant
const DEFAULT_USER_ID = '4f659eca-ae95-4bb9-8c38-452ce614d422';

export type CreateOrderResponse = {
  status: 'success' | 'error';
  data?: {
    order_number: string;
    amount: number;
    expires_at: string;
    payment_url: string;
    upi_id: string;
  };
  error?: string;
};

export const api = {
  orders: {
    create: async (amount: number): Promise<ApiResponse> => {
      const request: CreateOrderRequest = { amount };
      return apiMiddleware.handleCreateOrder(request);
    },

    getStatus: async (orderNumber: string): Promise<GetStatusResponse> => {
      const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}/status`);
      if (!response.ok) {
        throw new Error('Failed to get order status');
      }
      return response.json();
    },

    getByOrderNumber: async (orderNumber: string, apiKey: string) => {
      try {
        const headers = await authMiddleware.getAuthHeaders(apiKey);
        const response = await fetch(apiRoutes.orders.getByNumber(orderNumber), {
          headers
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to get order');
        }

        const data = await response.json();
        return data[0]; // Supabase returns array, get first item
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get order');
      }
    }
  },

  payments: {
    getStatus: async (orderNumber: string) => {
      try {
        const response = await fetch(apiRoutes.payments.getStatus(orderNumber), {
          headers: await authMiddleware.getAuthHeaders('') // Using anon key from environment
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to get payment status');
        }

        const data = await response.json();
        return data[0];
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get payment status');
      }
    }
  }
};
