import { useState, useEffect } from 'react';
import { 
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Download } from 'lucide-react';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  Button, 
  Card,
  CardContent,
  useTheme,
  Skeleton
} from '@mui/material';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Payment } from '../types/database.types';
import { toast } from 'sonner';

type CardType = 'deposits' | 'payouts';
type StatusType = 'total' | 'success' | 'pending' | 'failed';
type HistoricalData = {
  deposits: {
    total: number[];
    success: number[];
    pending: number[];
    failed: number[];
  };
  payouts: {
    total: number[];
    success: number[];
    pending: number[];
    failed: number[];
  };
};

function Dashboard() {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState('7d');
  const [loading] = useState(false); // Add loading state for real API integration
  const [transactionData, setTransactionData] = useState({
    deposits: {
      total: 0,
      success: 0,
      pending: 0,
      failed: 0
    },
    payouts: {
      total: 0,
      success: 0,
      pending: 0,
      failed: 0
    }
  });
  const [historicalData, setHistoricalData] = useState<HistoricalData>({
    deposits: { total: [], success: [], pending: [], failed: [] },
    payouts: { total: [], success: [], pending: [], failed: [] }
  });
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Initial fetch
    fetchTransactionData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('dashboard-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTransactionData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  const processHistoricalData = (payments: Payment[]) => {
    // Group by date and calculate daily totals
    const dailyTotals = payments.reduce((acc: { [key: string]: any }, payment) => {
      const date = new Date(payment.created_at).toISOString().split('T')[0];
      const type = payment.method === 'UPI' ? 'deposits' : 'payouts';
      
      if (!acc[date]) {
        acc[date] = {
          deposits: { total: 0, success: 0, pending: 0, failed: 0 },
          payouts: { total: 0, success: 0, pending: 0, failed: 0 }
        };
      }

      acc[date][type].total += payment.amount;
      switch (payment.status) {
        case 'COMPLETED':
          acc[date][type].success += payment.amount;
          break;
        case 'PENDING':
          acc[date][type].pending += payment.amount;
          break;
        case 'FAILED':
          acc[date][type].failed += payment.amount;
          break;
      }
      
      return acc;
    }, {});

    // Convert to arrays for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const historicalMetrics = {
      deposits: { total: [], success: [], pending: [], failed: [] },
      payouts: { total: [], success: [], pending: [], failed: [] }
    };

    last7Days.forEach(date => {
      const dayData = dailyTotals[date] || {
        deposits: { total: 0, success: 0, pending: 0, failed: 0 },
        payouts: { total: 0, success: 0, pending: 0, failed: 0 }
      };

      ['deposits', 'payouts'].forEach(type => {
        ['total', 'success', 'pending', 'failed'].forEach(status => {
          historicalMetrics[type][status].push(dayData[type][status]);
        });
      });
    });

    return historicalMetrics;
  };

  const fetchTransactionData = async () => {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Process current totals
      const metrics = payments.reduce((acc: typeof transactionData, payment: Payment) => {
        const category = payment.method === 'UPI' ? 'deposits' : 'payouts';
        acc[category].total += payment.amount;
        
        switch (payment.status) {
          case 'COMPLETED':
            acc[category].success += payment.amount;
            break;
          case 'PENDING':
            acc[category].pending += payment.amount;
            break;
          case 'FAILED':
            acc[category].failed += payment.amount;
            break;
        }
        
        return acc;
      }, {
        deposits: { total: 0, success: 0, pending: 0, failed: 0 },
        payouts: { total: 0, success: 0, pending: 0, failed: 0 }
      });

      // Process historical data
      const historical = processHistoricalData(payments);
      
      setTransactionData(metrics);
      setHistoricalData(historical);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      toast.error('Failed to fetch transaction data');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const renderMetricCard = (type: CardType, status: StatusType, value: number, label: string) => {
    const colors = {
      success: theme.palette.success.main,
      pending: theme.palette.warning.main,
      failed: theme.palette.error.main,
      total: theme.palette.primary.main
    };

    // Use real historical data instead of mock data
    const trendData = historicalData[type][status].map((value) => ({ value }));

    return (
      <Card 
        sx={{ 
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,  // Add this line
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          },
          height: '100%'
        }}
      >
        <CardContent>
          {loading ? (
            <Box sx={{ pt: 0.5 }}>
              <Skeleton width="60%" height={24} />
              <Skeleton width="100%" height={38} sx={{ mt: 1 }} />
              <Skeleton width="100%" height={30} sx={{ mt: 1 }} />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {label}
              </Typography>
              <Typography 
                variant="h4" 
                component="div"
                sx={{ 
                  color: colors[status],
                  fontWeight: 600,
                  mb: 1
                }}
              >
                {formatCurrency(value)}
              </Typography>
              <Box sx={{ height: 30, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={colors[status]}
                      strokeWidth={1.5}
                      dot={false}
                      animationDuration={500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your business performance
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>

          <Button
            variant="contained"
            startIcon={<Download size={16} />}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2  // Add this line
            }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Deposits Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Deposits
        </Typography>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 2
        }}>
          {renderMetricCard('deposits', 'total', transactionData.deposits.total, 'Total')}
          {renderMetricCard('deposits', 'success', transactionData.deposits.success, 'Success')}
          {renderMetricCard('deposits', 'pending', transactionData.deposits.pending, 'Pending')}
          {renderMetricCard('deposits', 'failed', transactionData.deposits.failed, 'Failed')}
        </Box>
      </Box>

      {/* Payouts Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Payouts
        </Typography>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 2
        }}>
          {renderMetricCard('payouts', 'total', transactionData.payouts.total, 'Total')}
          {renderMetricCard('payouts', 'success', transactionData.payouts.success, 'Success')}
          {renderMetricCard('payouts', 'pending', transactionData.payouts.pending, 'Pending')}
          {renderMetricCard('payouts', 'failed', transactionData.payouts.failed, 'Failed')}
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;