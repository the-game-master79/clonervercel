import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { Box, Typography, TextField, Button, Paper, InputAdornment, CircularProgress } from '@mui/material';
import { Lock, Mail, CreditCard } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuthStore(state => ({
    user: state.user,
    loading: state.loading
  }));
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password, rememberMe);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: 'grey.50',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left Panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          p: 8,
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'url("https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2574&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box sx={{ position: 'relative', maxWidth: 480, textAlign: 'center' }}>
          <CreditCard size={48} style={{ marginBottom: '1rem' }} />
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Welcome to TransactPro
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, opacity: 0.8 }}>
            Your all-in-one payment processing solution for modern businesses
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            justifyContent: 'center',
            '& > div': {
              textAlign: 'left',
              p: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              flex: 1
            }
          }}>
            <Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>99.9%</Typography>
              <Typography variant="body2">System Uptime</Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>2M+</Typography>
              <Typography variant="body2">Transactions</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Panel */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, sm: 8 }
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 6 },
            width: '100%',
            maxWidth: 480,
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            Sign In
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Welcome back! Please enter your details
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              <Link
                to="/reset-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </Paper>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 3, textAlign: 'center' }}
        >
          Need technical support?{' '}
          <Link
            to="#"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Contact us
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default Login;