import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button,
  useTheme,
  CircularProgress
} from '@mui/material';
import { Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ordersService, OrderStatus } from '../services/orders';
import { paymentsService } from '../services/payments';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import type { Order } from '../types/database.types';

// Update timer constants
const PAYMENT_TIMEOUT = 7 * 60; // 7 minutes in seconds
const UPI_ID = 'vermils@ybl';
const AMOUNT = 100; // You can make this dynamic if needed

function Order() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [orderIdCopied, setOrderIdCopied] = useState(false);    
  const [utrError, setUtrError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const shouldNavigateRef = useRef(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const statusCheckRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkExistingOrder = async () => {
      try {
        // Check for any pending orders
        const { data: existingOrders } = await supabase
          .from('orders')
          .select<'orders', Order>('*')
          .eq('user_id', user.id)
          .eq('status', 'PENDING')
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingOrders && existingOrders.length > 0) {
          const existingOrder = existingOrders[0];
          // Check if order is still valid
          if (new Date(existingOrder.expires_at) > new Date()) {
            setOrderId(existingOrder.id);
            setOrderNumber(existingOrder.order_number);
            setExpiresAt(existingOrder.expires_at);
            setLoading(false);
            return;
          }
        }

        // Create new order if no valid pending order exists
        const orderData = {
          upi_id: UPI_ID,
          amount: AMOUNT,
          user_id: user.id,
          expires_at: new Date(Date.now() + PAYMENT_TIMEOUT * 1000).toISOString()
        };

        const { order } = await ordersService.createOrderWithPayment(orderData);
        setOrderId(order.id);
        setOrderNumber(order.order_number);
        setExpiresAt(order.expires_at);
      } catch (error: any) {
        shouldNavigateRef.current = true;
        toast.error('Failed to create order');
      } finally {
        setLoading(false);
      }
    };

    checkExistingOrder();

    // Cleanup function
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusCheckRef.current) clearInterval(statusCheckRef.current);
      if (shouldNavigateRef.current) {
        navigate('/payments');
      }
    };
  }, [user.id, navigate]);

  useEffect(() => {
    if (!expiresAt) return;

    timerRef.current = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        shouldNavigateRef.current = true;
        toast.error('Payment time expired');
        navigate('/payments');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expiresAt, navigate]);

  useEffect(() => {
    if (!orderId) return;

    statusCheckRef.current = setInterval(async () => {
      try {
        const order = await ordersService.checkOrderStatus(orderId);
        if (order.status === OrderStatus.FAILED) {
          if (statusCheckRef.current) clearInterval(statusCheckRef.current);
          toast.error('Payment time expired');
          navigate('/payments');
        }
      } catch (error) {
        console.error('Failed to check order status:', error);
      }
    }, 10000);

    return () => {
      if (statusCheckRef.current) clearInterval(statusCheckRef.current);
    };
  }, [orderId, navigate]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOrderIdCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setOrderIdCopied(true);
    setTimeout(() => setOrderIdCopied(false), 2000);
  };

  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) {
      setUtrError('Only numbers are allowed');
      return;
    }
    
    setUtrNumber(value);
    
    if (value.length > 0 && value.length !== 12) {
      setUtrError('UTR number must be 12 digits');
    } else {
      setUtrError('');
    }
  };

  const handleUtrSubmit = async () => {
    if (!orderId || !user.id) return;
    
    setSubmitting(true);
    try {
      // Use a single query to check current status before updating
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (order?.status !== OrderStatus.PENDING) {
        toast.error('Order is no longer pending');
        return;
      }

      // Update both order and payment in a transaction-like manner
      await Promise.all([
        ordersService.updateOrder(orderId, {
          utr_number: utrNumber,
          status: OrderStatus.PROCESSING
        }),
        paymentsService.updatePaymentByUTR(orderNumber, user.id, { 
          utr_number: utrNumber,
          status: OrderStatus.PROCESSING
        })
      ]);
      
      toast.success('UTR number submitted successfully');
      navigate('/payments');
    } catch (error: any) {
      toast.error('Failed to submit UTR number');
    } finally {
      setSubmitting(false);
    }
  };

  // Add timeLeft calculation helper
  const calculateProgress = (timeLeft: number) => {
    return (timeLeft / PAYMENT_TIMEOUT) * 100;
  };

  // Add loading state to the UI
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, mb: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            mb: 3
          }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              #{orderNumber}
            </Typography>
            <Button
              startIcon={orderIdCopied ? <Check size={20} /> : <Copy size={20} />}
              onClick={handleOrderIdCopy}
              variant="outlined"
              size="large"
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {orderIdCopied ? 'Copied' : 'Copy'}
            </Button>
          </Box>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'grey.50', 
            borderRadius: 2,
            display: 'inline-block',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
              You're Paying
            </Typography>
            <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              ₹100.00
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 4,
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '2px dashed',
          borderColor: 'divider'
        }}>
          <QRCodeSVG 
            value={`upi://pay?pa=${UPI_ID}&pn=Your%20Business&am=100&cu=INR`}
            size={250}
            level="H"
            includeMargin={true}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            UPI ID
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: `2px solid ${theme.palette.divider}`,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: 'grey.50'
            }
          }}>
            <Typography variant="h6" sx={{ flex: 1, fontFamily: 'monospace' }}>{UPI_ID}</Typography>
            <Button
              startIcon={copied ? <Check size={20} /> : <Copy size={20} />}
              onClick={handleCopy}
              variant="contained"
              size="large"
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {copied ? 'Copied!' : 'Copy UPI ID'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Enter UTR Number
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter 12-digit UTR number after payment"
            value={utrNumber}
            onChange={handleUtrChange}
            error={!!utrError}
            helperText={utrError}
            inputProps={{ 
              maxLength: 12,
              pattern: '[0-9]*',
              inputMode: 'numeric',
              style: { fontSize: '1.2rem', padding: '16px' }
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              }
            }}
          />
          <Button
            variant="contained"
            fullWidth
            disabled={!utrNumber || utrNumber.length !== 12 || submitting}
            onClick={handleUtrSubmit}
            sx={{
              py: 2,
              borderRadius: 2,
              fontSize: '1.1rem',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {submitting ? 'Submitting...' : 'Submit UTR'}
          </Button>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: timeLeft < 60 ? 'error.50' : 'grey.50',
          color: timeLeft < 60 ? theme.palette.error.main : theme.palette.text.primary
        }}>
          {timeLeft > 0 && (
            <CircularProgress 
              size={24} 
              value={calculateProgress(timeLeft)}
              variant="determinate"
              color={timeLeft < 60 ? 'error' : 'primary'}
            />
          )}
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {timeLeft > 0 ? formatTime(timeLeft) : 'Order expired'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Order;