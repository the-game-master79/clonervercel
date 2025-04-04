import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Home } from 'lucide-react';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'grey.50',
      p: 3
    }}>
      <Box sx={{ 
        maxWidth: 400,
        textAlign: 'center'
      }}>
        <Typography variant="h1" sx={{ 
          fontSize: '8rem',
          fontWeight: 700,
          color: 'primary.main',
          mb: 2
        }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Home size={20} />}
          onClick={() => navigate('/')}
          sx={{ 
            py: 1.5,
            px: 4,
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          Back to Home
        </Button>
      </Box>
    </Box>
  );
}

export default NotFound;
