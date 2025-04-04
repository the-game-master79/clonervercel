import { supabase } from '../lib/supabase';
import type { Database, PaymentStatus } from '../types/database.types';

export const paymentsService = {
  async createPayment(payment: Database['public']['Tables']['payments']['Insert']) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePayment(id: string, payment: Database['public']['Tables']['payments']['Update']) {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
    return data;
  },

  async updatePaymentByUTR(order_number: string, user_id: string, payment: Database['public']['Tables']['payments']['Update']) {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .match({ order_number, user_id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getPaymentById(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
