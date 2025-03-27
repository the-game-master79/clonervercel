import React from 'react';
import { Code } from 'lucide-react';

const API: React.FC = () => {
  const apiJson = {
    endpoint: '/api/create-order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer <your_api_key>',
    },
    body: {
      transaction_id: '<uuid>',
      type: 'IN',
      amount: '<numeric>',
      method: '<string>',
      status: 'PENDING',
    },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">API Documentation</h2>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Order API</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use the following JSON structure to create an order via the API.
        </p>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 overflow-auto">
          {JSON.stringify(apiJson, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default API;
