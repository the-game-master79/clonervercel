import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { PaymentMethod } from '../types';

const PaymentIn: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [selectedType, setSelectedType] = useState<PaymentMethod['type']>('BANK');
  const [formData, setFormData] = useState({
    timeLimit: '',
    cryptoAddress: '',
    cryptoNetwork: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    upiId: '',
    qrImage: null as File | null,
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data, error } = await supabase.from('payment_methods').select('*');
      if (error) {
        console.error('Error fetching payment methods:', error);
      } else {
        setPaymentMethods(data || []);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const details = {
      ...(selectedType === 'CRYPTO' && {
        cryptoAddress: formData.cryptoAddress,
        cryptoNetwork: formData.cryptoNetwork,
      }),
      ...(selectedType === 'BANK' && {
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc,
        bankName: formData.bankName,
      }),
      ...(selectedType === 'UPI' && {
        upiId: formData.upiId,
        minAmount: formData.minAmount,
        maxAmount: formData.maxAmount,
      }),
    };

    const qrCode = formData.qrImage; // Use the QR code URL directly

    if (editingMethod) {
      // Update existing payment method
      const { error } = await supabase
        .from('payment_methods')
        .update({
          type: selectedType,
          details,
          qr_code: qrCode,
          time_limit: parseInt(formData.timeLimit),
        })
        .eq('id', editingMethod.id);

      if (error) {
        console.error('Error updating payment method:', error);
      } else {
        setPaymentMethods((prev) =>
          prev.map((method) =>
            method.id === editingMethod.id
              ? { ...method, type: selectedType, details, qr_code: qrCode, time_limit: parseInt(formData.timeLimit) }
              : method
          )
        );
      }
    } else {
      // Add new payment method
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          type: selectedType,
          details,
          qr_code: qrCode,
          time_limit: parseInt(formData.timeLimit),
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding payment method:', error);
      } else {
        setPaymentMethods((prev) => [...prev, data]);
      }
    }

    setIsModalOpen(false);
    setEditingMethod(null);
    setFormData({
      timeLimit: '',
      cryptoAddress: '',
      cryptoNetwork: '',
      accountNumber: '',
      ifsc: '',
      bankName: '',
      upiId: '',
      qrImage: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setSelectedType(method.type);
    setFormData({
      timeLimit: method.time_limit.toString(),
      cryptoAddress: method.details.cryptoAddress || '',
      cryptoNetwork: method.details.cryptoNetwork || '',
      accountNumber: method.details.accountNumber || '',
      ifsc: method.details.ifsc || '',
      bankName: method.details.bankName || '',
      upiId: method.details.upiId || '',
      qrImage: null,
      minAmount: method.details.minAmount || '',
      maxAmount: method.details.maxAmount || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (methodId: string) => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', methodId);
    if (error) {
      console.error('Error deleting payment method:', error);
    } else {
      setPaymentMethods((prev) => prev.filter((method) => method.id !== methodId));
    }
  };

  const renderFormFields = () => {
    switch (selectedType) {
      case 'CRYPTO':
      case 'UPI':
        return (
          <>
            {selectedType === 'CRYPTO' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Crypto Address</label>
                  <input
                    type="text"
                    value={formData.cryptoAddress || ''} // Ensure value is always a string
                    onChange={(e) => setFormData({ ...formData, cryptoAddress: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Network</label>
                  <input
                    type="text"
                    value={formData.cryptoNetwork || ''} // Ensure value is always a string
                    onChange={(e) => setFormData({ ...formData, cryptoNetwork: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </>
            )}
            {selectedType === 'UPI' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                  <input
                    type="text"
                    value={formData.upiId || ''} // Ensure value is always a string
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minAmount || ''} // Ensure value is always a string
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxAmount || ''} // Ensure value is always a string
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">QR Code URL</label>
              <input
                type="url"
                value={formData.qrImage || ''}
                onChange={(e) => setFormData({ ...formData, qrImage: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter QR Code URL"
              />
            </div>
          </>
        );
      case 'BANK':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber || ''} // Ensure value is always a string
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc || ''} // Ensure value is always a string
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                type="text"
                value={formData.bankName || ''} // Ensure value is always a string
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Payment Methods</h2>
        <button
          onClick={() => {
            setEditingMethod(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Method
        </button>
      </div>

      {/* Payment Methods Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                QR Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Limit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentMethods.map((method) => (
              <tr key={method.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{method.type}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {method.type === 'BANK' && (
                      <>
                        {method.details.bankName} - {method.details.accountNumber} - {method.details.ifsc}
                      </>
                    )}
                    {method.type === 'UPI' && (
                      <>
                        {method.details.upiId}
                        <br />
                        Min: ₹{method.details.minAmount}, Max: ₹{method.details.maxAmount}
                      </>
                    )}
                    {method.type === 'CRYPTO' && (
                      <>
                        {method.details.cryptoNetwork} - {method.details.cryptoAddress}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {method.qr_code && (
                    <img src={method.qr_code} alt="QR Code" className="w-16 h-16 object-cover rounded-md" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{method.time_limit} minutes</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      method.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {method.status ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(method)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as PaymentMethod['type'])}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="CRYPTO">Crypto</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              {renderFormFields()}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLimit: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentIn;