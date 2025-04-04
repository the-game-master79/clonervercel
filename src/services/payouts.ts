import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export const payoutsService = {
  async createPayout(payout: Database['public']['Tables']['payouts']['Insert']) {
    const { data, error } = await supabase
      .from('payouts')
      .insert(payout)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPayouts() {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updatePayoutStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('payouts')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  generatePayoutNumber: () => {
    // Format: PYXXXXXNNN where:
    // PY = payout prefix
    // XXXXX = random 5 digits
    // NNN = sequential number padded to 3 digits
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PY${random}${sequence}`;
  },
};
