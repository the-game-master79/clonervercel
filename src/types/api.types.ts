export type CreateOrderRequest = {
  amount: number;
};

export type ApiResponse = {
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

export type GetStatusResponse = {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  order_number: string;
  amount: number;
  expires_at: string;
};
