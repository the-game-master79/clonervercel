export interface PaymentMethod {
  id: string;
  type: 'CRYPTO' | 'BANK' | 'UPI';
  details: {
    cryptoAddress?: string;
    cryptoNetwork?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
    upiId?: string;
  };
  timeLimit: number;
  active: boolean;
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'IN' | 'OUT';
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface AuthUser {
  email: string;
  password: string;
}