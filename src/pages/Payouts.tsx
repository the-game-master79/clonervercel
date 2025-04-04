import React, { useState } from 'react';
import { 
  PlusCircle,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  IconButton,
  useTheme
} from '@mui/material';

// Mock data for initial development
const mockPayouts = [
  {
    id: 'po_1',
    date: '2024-03-10',
    amount: 2500.00,
    status: 'completed',
    recipient: 'John Smith',
    bankAccount: '**** 1234',
    reference: 'PO123456'
  },
  {
    id: 'po_2',
    date: '2024-03-09',
    amount: 1750.50,
    status: 'processing',
    recipient: 'Jane Doe',
    bankAccount: '**** 5678',
    reference: 'PO789012'
  }
];

// Mock virtual account details
const virtualAccountDetails = {
  accountNumber: '123456789012',
  ifscCode: 'SBIN0001234',
  accountName: 'Your Business Name',
  bankName: 'State Bank of India'
};

function Payouts() {
  const theme = useTheme();
  const [showNewPayoutForm, setShowNewPayoutForm] = useState(false);
  const [showVirtualAccountDialog, setShowVirtualAccountDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');
  const [formData, setFormData] = useState({
    recipient: '',
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    amount: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to process the payout
    toast.success('Payout initiated successfully');
    setShowNewPayoutForm(false);
    setFormData({
      recipient: '',
      upiId: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      amount: '',
      description: ''
    });
  };

  const renderPaymentForm = () => {
    if (paymentMethod === 'upi') {
      return (
        <TextField
          fullWidth
          label="UPI ID"
          value={formData.upiId}
          onChange={(e) => setFormData({...formData, upiId: e.target.value})}
          required
          sx={{ mb: 2 }}
        />
      );
    }

    return (
      <>
        <TextField
          fullWidth
          label="Bank Name"
          value={formData.bankName}
          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Account Number"
          value={formData.accountNumber}
          onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="IFSC Code"
          value={formData.ifscCode}
          onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
          required
          sx={{ mb: 2 }}
        />
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Payouts
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search payouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: <Search size={16} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
            }}
          />

          <Button
            variant="contained"
            startIcon={<PlusCircle size={16} />}
            onClick={() => setShowNewPayoutForm(true)}
            sx={{ textTransform: 'none' }}
          >
            New Payout
          </Button>

          <IconButton
            onClick={() => setShowVirtualAccountDialog(true)}
            sx={{ color: theme.palette.primary.main }}
          >
            <Info size={20} />
          </IconButton>
        </Box>
      </Box>

      {showNewPayoutForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Create New Payout
          </Typography>
          
          <Tabs
            value={paymentMethod}
            onChange={(_, newValue) => setPaymentMethod(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab value="upi" label="UPI" />
            <Tab value="bank" label="Bank Account" />
          </Tabs>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Recipient Name"
              value={formData.recipient}
              onChange={(e) => setFormData({...formData, recipient: e.target.value})}
              required
              sx={{ mb: 2 }}
            />

            {renderPaymentForm()}

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowNewPayoutForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
              >
                Create Payout
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {/* Virtual Account Dialog */}
      <Dialog
        open={showVirtualAccountDialog}
        onClose={() => setShowVirtualAccountDialog(false)}
      >
        <DialogTitle>Virtual Account Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Account Details
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="body2">
                <strong>Account Number:</strong> {virtualAccountDetails.accountNumber}
              </Typography>
              <Typography variant="body2">
                <strong>IFSC Code:</strong> {virtualAccountDetails.ifscCode}
              </Typography>
              <Typography variant="body2">
                <strong>Account Name:</strong> {virtualAccountDetails.accountName}
              </Typography>
              <Typography variant="body2">
                <strong>Bank Name:</strong> {virtualAccountDetails.bankName}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVirtualAccountDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payouts Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1 cursor-pointer">
                  <span>Date</span>
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bank Account
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockPayouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payout.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payout.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payout.recipient}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payout.bankAccount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${payout.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payout.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : payout.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payout.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing 1 to 10 of 20 results
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small">
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton size="small">
              <ChevronRight size={16} />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Payouts;