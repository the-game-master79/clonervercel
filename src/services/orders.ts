import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

// Add default user ID constant
const DEFAULT_USER_ID = '4f659eca-ae95-4bb9-8c38-452ce614d422';

export const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;


export const ordersService = {
  generateOrderNumber: () => {
    // Format: YXXXXXNNN where:
    // Y = last digit of year
    // XXXXX = random 5 digits
    // NNN = sequential number padded to 3 digits
    const year = new Date().getFullYear().toString().slice(-1);
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${year}${random}${sequence}`; // Total 9 chars
  },

  async createOrder(order: Database['public']['Tables']['orders']['Insert']) {
    // Ensure required fields
    if (!order.order_number) {
      order.order_number = this.generateOrderNumber();
    }
    if (!order.upi_id) {
      order.upi_id = 'vermils@ybl';
    }
    if (!order.status) {
      order.status = OrderStatus.PENDING;
    }
    if (!order.expires_at) {
      order.expires_at = new Date(Date.now() + 7 * 60 * 1000).toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrder(id: string, order: Database['public']['Tables']['orders']['Update']) {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrderByNumber(orderNumber: string, order: Database['public']['Tables']['orders']['Update']) {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('order_number', orderNumber)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrder(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createOrderWithPayment(order: Database['public']['Tables']['orders']['Insert']) {
    // Only pass essential fields, let database handle defaults
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({ 
        amount: order.amount,
        user_id: DEFAULT_USER_ID // Always use default user ID
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create associated payment using order data
    const payment = {
      order_number: orderData.order_number,
      recipient_name: 'Customer Payment',
      method: 'UPI' as const,
      amount: order.amount,
      status: OrderStatus.PENDING,
      user_id: DEFAULT_USER_ID // Always use default user ID
    };

    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (paymentError) {
      await supabase.from('orders').delete().eq('id', orderData.id);
      throw paymentError;
    }

    return { order: orderData, payment: paymentData };
  },

  // Update checkOrderStatus to also update payment status
  async checkOrderStatus(orderId: string) {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    // Check if order has expired
    if (order.status === OrderStatus.PENDING) {
      const expiryTime = new Date(order.expires_at);
      if (expiryTime < new Date()) {
        // Update order status
        await this.updateOrder(orderId, { status: OrderStatus.FAILED });
        
        // Also update payment status
        await supabase
          .from('payments')
          .update({ status: OrderStatus.FAILED })
          .eq('order_number', order.order_number);

        return { ...order, status: OrderStatus.FAILED };
      }
    }

    return order;
  }
};
