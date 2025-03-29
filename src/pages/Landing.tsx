import React, { useState, useEffect } from 'react';
import { Bitcoin, Ban as Bank, Smartphone, Loader, Clipboard, ClipboardCheck, Wallet } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useSearchParams } from 'react-router-dom';
import { useTransactionExpiration } from '../hooks/useTransactionExpiration';

interface PaymentMethod {
  id: string;
  type: 'CRYPTO' | 'BANK' | 'UPI';
  details: {
    cryptoAddress?: string;
    cryptoNetwork?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
    upiId?: string;
    minAmount?: number;
    maxAmount?: number;
  };
  qr_code?: string;
}

const Landing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CRYPTO' | 'UPI' | 'BANK' | null>(null); // Default to null
  const [availableTabs, setAvailableTabs] = useState<string[]>([]); // Track available tabs
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const expiresAt = searchParams.get('expiresAt');
  const { isExpired, timeLeft } = useTransactionExpiration(orderNumber, expiresAt);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'PENDING' | 'PROCESSING' | 'EXPIRED' | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [utrError, setUtrError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('status', true)
        .neq('type', 'DEMO'); // Exclude "DEMO" methods
      if (error) {
        console.error('Error fetching payment methods:', error);
      } else {
        setPaymentMethods(data || []);
        const types = Array.from(new Set(data.map((method) => method.type))); // Extract unique types
        setAvailableTabs(types);
        setActiveTab(types[0] || null); // Set the first available tab as active
        setSelectedPaymentMethod(data?.[0] || null); // Default to the first method
      }
    };

    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (timeLeft === 'Expired' && orderNumber) {
      const updateTransactionStatus = async () => {
        const { error } = await supabase
          .from('transactions_history')
          .update({ status: 'EXPIRED' })
          .eq('transaction_id', orderNumber)
          .eq('status', 'PENDING'); // Ensure only pending orders are updated
        if (error) {
          console.error('Error updating transaction status:', error.message);
        }
      };

      updateTransactionStatus();
    }
  }, [timeLeft, orderNumber]);

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      if (orderNumber) {
        const { data, error } = await supabase
          .from('transactions_history')
          .select('status')
          .eq('transaction_id', orderNumber)
          .single();

        if (error) {
          console.error('Error fetching transaction status:', error.message);
        } else {
          setTransactionStatus(data?.status || null);
        }
      }
    };

    fetchTransactionStatus();
  }, [orderNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    if (orderNumber && transactionId && amount) {
      const { error } = await supabase
        .from('transactions_history')
        .update({ utr_info: transactionId, status: 'PROCESSING', amount }) // Save UTR info, status, and amount
        .eq('transaction_id', orderNumber)
        .eq('status', 'PENDING'); // Ensure only pending orders are updated

      if (error) {
        console.error('Error saving transaction ID:', error.message);
      } else {
        console.log('Transaction status updated to PROCESSING successfully');
        setTransactionStatus('PROCESSING'); // Update local state
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
    }, 15000); // Simulate 15 minutes processing time
  };

  const handleCopyTransactionId = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      });
    }
  };

  const handleAmountChange = (value: string) => {
    const numValue = Number(value);
    setAmount(numValue || '');
    
    if (!value) {
      setAmountError('Amount is required');
    } else if (selectedPaymentMethod?.details.minAmount && numValue < selectedPaymentMethod.details.minAmount) {
      setAmountError(`Amount must be at least ₹${selectedPaymentMethod.details.minAmount}`);
    } else if (selectedPaymentMethod?.details.maxAmount && numValue > selectedPaymentMethod.details.maxAmount) {
      setAmountError(`Amount must not exceed ₹${selectedPaymentMethod.details.maxAmount}`);
    } else {
      setAmountError(null);
    }
  };

  const handleUtrChange = (value: string) => {
    // Remove any non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    setTransactionId(cleanValue);
    
    if (!cleanValue) {
      setUtrError('UTR number is required');
    } else if (cleanValue.length !== 12) {
      setUtrError('UTR must be exactly 12 digits');
    } else {
      setUtrError(null);
    }
  };

  const filteredPaymentMethods = paymentMethods.filter((method) => method.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      {isSubmitting ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Processing...</h2>
          <p className="text-sm text-gray-600 mt-2">
            If payment is made, it will be processed within 15 minutes.
          </p>
        </div>
      ) : (
        <>
          {transactionStatus === 'PROCESSING' ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Processing...</h2>
              <p className="text-sm text-gray-600 mt-2">
                Your payment is being processed. Please wait for confirmation. You are free to exit this screen.
              </p>
            </div>
          ) : (
            <>
              {/* Existing UI */}
              <div className="flex items-center gap-2 mb-8">
                <Wallet className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-800">PayTracker</span>
              </div>
              <div className="max-w-md w-full space-y-8">
                {isExpired ? (
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-lg font-bold text-red-600">Order is expired, Please place a new one!</p>
                  </div>
                ) : (
                  <>
                    {orderNumber && (
                      <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Order Number:</strong> {orderNumber}
                          <button
                            onClick={handleCopyTransactionId}
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                            title="Copy Transaction ID"
                          >
                            {isCopied ? (
                              <ClipboardCheck className="inline h-5 w-5" />
                            ) : (
                              <Clipboard className="inline h-5 w-5" />
                            )}
                          </button>
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Status:</strong> {transactionStatus || 'Pending'}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Time Left:</strong> {timeLeft}
                        </p>
                      </div>
                    )}
                    {paymentMethods.length > 0 && (
                      <div className="bg-white shadow rounded-lg overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                          {availableTabs.includes('CRYPTO') && (
                            <button
                              onClick={() => setActiveTab('CRYPTO')}
                              className={`flex-1 py-4 px-4 text-center text-sm font-medium ${
                                activeTab === 'CRYPTO'
                                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              <Bitcoin className="h-5 w-5 mx-auto mb-1" />
                              Crypto
                            </button>
                          )}
                          {availableTabs.includes('UPI') && (
                            <button
                              onClick={() => setActiveTab('UPI')}
                              className={`flex-1 py-4 px-4 text-center text-sm font-medium ${
                                activeTab === 'UPI'
                                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              <Smartphone className="h-5 w-5 mx-auto mb-1" />
                              UPI
                            </button>
                          )}
                          {availableTabs.includes('BANK') && (
                            <button
                              onClick={() => setActiveTab('BANK')}
                              className={`flex-1 py-4 px-4 text-center text-sm font-medium ${
                                activeTab === 'BANK'
                                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              <Bank className="h-5 w-5 mx-auto mb-1" />
                              Bank Transfer
                            </button>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {filteredPaymentMethods.length > 1 && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700">Select Payment Method</label>
                              <select
                                value={selectedPaymentMethod?.id || ''}
                                onChange={(e) =>
                                  setSelectedPaymentMethod(filteredPaymentMethods.find((method) => method.id === e.target.value) || null)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              >
                                {filteredPaymentMethods.map((method) => (
                                  <option key={method.id} value={method.id}>
                                    {method.type}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {activeTab === 'CRYPTO' && selectedPaymentMethod?.type === 'CRYPTO' && (
                            <div className="space-y-4">
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">Send payment to:</p>
                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md break-all">
                                  {selectedPaymentMethod.details.cryptoAddress}
                                </p>
                                <p className="mt-2 text-sm text-gray-500">
                                  Network: {selectedPaymentMethod.details.cryptoNetwork}
                                </p>
                                {selectedPaymentMethod.qr_code && (
                                  <img
                                    src={selectedPaymentMethod.qr_code} // Use the QR code URL directly
                                    alt="QR Code"
                                    className="mt-4 mx-auto w-32 h-32 object-cover rounded-md"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {activeTab === 'UPI' && selectedPaymentMethod?.type === 'UPI' && (
                            <div className="space-y-4">
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">UPI ID:</p>
                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                  {selectedPaymentMethod.details.upiId}
                                </p>
                                {selectedPaymentMethod.qr_code && (
                                  <img
                                    src={selectedPaymentMethod.qr_code} // Use the QR code URL directly
                                    alt="QR Code"
                                    className="mt-4 mx-auto w-32 h-32 object-cover rounded-md"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {activeTab === 'BANK' && selectedPaymentMethod?.type === 'BANK' && (
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Account Details:</p>
                                <div className="mt-2 bg-gray-50 p-4 rounded-md">
                                  <dl className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                      <dt>Account Number:</dt>
                                      <dd className="font-medium">{selectedPaymentMethod.details.accountNumber}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt>IFSC Code:</dt>
                                      <dd className="font-medium">{selectedPaymentMethod.details.ifsc}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt>Bank Name:</dt>
                                      <dd className="font-medium">{selectedPaymentMethod.details.bankName}</dd>
                                    </div>
                                  </dl>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Transaction ID Input (for UPI and Bank Transfer) */}
                          {(activeTab === 'UPI' || activeTab === 'BANK') && (
                            <form onSubmit={handleSubmit} className="mt-6">
                              <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                  Amount (₹)
                                </label>
                                <input
                                  type="number"
                                  id="amount"
                                  value={amount}
                                  onChange={(e) => handleAmountChange(e.target.value)}
                                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                    amountError ? 'border-red-500' : ''
                                  }`}
                                  placeholder={`Enter amount between ₹${selectedPaymentMethod?.details.minAmount} and ₹${selectedPaymentMethod?.details.maxAmount}`}
                                  min={selectedPaymentMethod?.details.minAmount}
                                  max={selectedPaymentMethod?.details.maxAmount}
                                  required
                                  disabled={transactionStatus === 'PROCESSING'}
                                />
                                {amountError && <p className="mt-1 text-sm text-red-600">{amountError}</p>}
                              </div>
                              <div className="mt-4">
                                <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
                                  {activeTab === 'UPI' ? 'UPI Transaction ID' : 'UTR Number'}
                                </label>
                                <input
                                  type="text"
                                  id="transactionId"
                                  value={transactionId}
                                  onChange={(e) => handleUtrChange(e.target.value)}
                                  maxLength={12}
                                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                    utrError ? 'border-red-500' : ''
                                  }`}
                                  placeholder={`Enter ${activeTab === 'UPI' ? 'UPI Transaction ID' : 'UTR Number'}`}
                                  required
                                  disabled={transactionStatus === 'PROCESSING'}
                                />
                                {utrError && <p className="mt-1 text-sm text-red-600">{utrError}</p>}
                              </div>
                              <button
                                type="submit"
                                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={isSubmitting || transactionStatus === 'PROCESSING' || !!utrError || !!amountError}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader className="animate-spin h-5 w-5 mr-2" />
                                    Processing...
                                  </>
                                ) : (
                                  'Submit'
                                )}
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Landing;