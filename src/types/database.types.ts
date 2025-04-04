export type PaymentMethod = 'UPI' | 'BANK_TRANSFER' | 'CRYPTO';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  created_at: string;
  order_number: string;  // Made required
  utr_number?: string;   // Optional
  recipient_name: string; // Made required
  method: PaymentMethod; // Made required
  amount: number; // Already required
  status: PaymentStatus; // Made required
  description?: string; // Optional
  user_id: string; // Made required
}

export interface Order {
  id: string;
  created_at: string;
  order_number: string; // Required
  upi_id: string; // Required
  amount: number; // Required
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'; // Required
  utr_number?: string; // Optional
  user_id: string; // Required
  expires_at: string; // Required
}

export interface Payout {
  id: string;
  created_at: string;
  order_number: string;
  utr_number?: string;
  recipient_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  amount: number;
  status: PaymentStatus;
  user_id: string;
  description?: string;
}

export type Database = {
  public: {
    Tables: {
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at'>;
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at'> & {
          order_number: string; // Explicitly required
          upi_id: string;      // Explicitly required
          amount: number;      // Explicitly required
          status: Order['status']; // Explicitly required
          user_id: string;     // Explicitly required
          expires_at: string;  // Explicitly required
        };
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      payouts: {
        Row: Payout;
        Insert: Omit<Payout, 'id' | 'created_at'>;
        Update: Partial<Omit<Payout, 'id' | 'created_at'>>;
      };
    };
  };
};
