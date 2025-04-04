export const BASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const apiRoutes = {
  orders: {
    create: `${BASE_URL}/rest/v1/orders`,
    getByNumber: (orderNumber: string) => `${BASE_URL}/rest/v1/orders?order_number=eq.${orderNumber}&select=*`,
    getById: (orderId: string) => `${BASE_URL}/rest/v1/orders?id=eq.${orderId}&select=*`,
    getStatus: (orderId: string) => `${BASE_URL}/rest/v1/orders?id=eq.${orderId}&select=status,order_number,amount,expires_at`,
    verify: (orderNumber: string) => `${BASE_URL}/rest/v1/orders?order_number=eq.${orderNumber}&select=status,payment_status,utr_number`,
  },
  payments: {
    getStatus: (orderNumber: string) => `${BASE_URL}/rest/v1/payments?order_number=eq.${orderNumber}&select=*`,
    getById: (paymentId: string) => `${BASE_URL}/rest/v1/payments?id=eq.${paymentId}&select=*`,
  }
};
