import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Button,
  Alert
} from '@mui/material';
import { Copy, Check } from 'lucide-react';  // Removed ExternalLink

const ApiDocs: React.FC = () => {
  const [baseUrlCopied, setBaseUrlCopied] = useState(false);

  const handleBaseUrlCopy = () => {
    navigator.clipboard.writeText('https://uosbethepnjrewxiinsr.supabase.co/rest/v1');
    setBaseUrlCopied(true);
    setTimeout(() => setBaseUrlCopied(false), 2000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        API Documentation
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Authentication
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            All API requests require authentication using your API key as the 'apikey' header:
          </Typography>
          <Box component="pre" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, overflow: 'auto', mb: 2 }}>
            {JSON.stringify({
              headers: {
                "apikey": "YOUR_API_KEY",
                "Content-Type": "application/json"
              }
            }, null, 2)}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Each key is valid for 1 year from creation.
          </Typography>
        </Box>
        <Alert severity="warning">
          Keep your API keys secure and never share them publicly. Generate separate keys for different environments.
        </Alert>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Base URL
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            All API endpoints are relative to:
          </Typography>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2 
          }}>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                overflow: 'auto',
                flex: 1
              }}
            >
              https://uosbethepnjrewxiinsr.supabase.co/rest/v1
            </Box>
            <Button
              variant="outlined"
              startIcon={baseUrlCopied ? <Check size={16} /> : <Copy size={16} />}
              onClick={handleBaseUrlCopy}
              sx={{ minWidth: 100 }}
            >
              {baseUrlCopied ? 'Copied!' : 'Copy'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Orders
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography component="span" sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem'
                  }}>
                    POST
                  </Typography>
                  <Typography component="span">
                    /orders
                  </Typography>
                </Box>
              }
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Create a new payment order with UPI details. Required fields will be auto-generated.
                      The order will expire after 7 minutes if not paid.
                    </Typography>
                  </Box>

                  <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                    Request Headers:
                  </Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, overflow: 'auto', mb: 2 }}>
                    {JSON.stringify({
                      "apikey": "YOUR_API_KEY",
                      "Content-Type": "application/json",
                      "Prefer": "return=representation"
                    }, null, 2)}
                  </Box>

                  <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                    Request Body:
                  </Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, overflow: 'auto', mb: 2 }}>
                    {JSON.stringify({
                      amount: 1000.00  // Required: Amount in INR
                    }, null, 2)}
                  </Box>

                  <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                    Success Response (200):
                  </Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, overflow: 'auto', mb: 2 }}>
                    {JSON.stringify({
                      status: "success",
                      data: {
                        order_number: "412345001",      // Auto-generated
                        amount: 1000.00,                // From request
                        expires_at: "2024-03-15T10:30:00Z",  // Auto-set to 7 mins
                        payment_url: "https://uosbethepnjrewxiinsr.supabase.co/rest/v1/payments/412345001",
                        upi_id: "yourbusiness@upi"      // Auto-set
                      }
                    }, null, 2)}
                  </Box>

                  <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                    Error Responses:
                  </Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, overflow: 'auto' }}>
                    {JSON.stringify([
                      {
                        status: "error",
                        error: "Invalid amount"
                      },
                      {
                        status: "error", 
                        error: "API key is required"
                      },
                      {
                        status: "error",
                        error: "Invalid API key"
                      }
                    ], null, 2)}
                  </Box>
                </Box>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography component="span" sx={{ 
                    bgcolor: 'success.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem'
                  }}>
                    GET
                  </Typography>
                  <Typography component="span">
                    /orders/{'{orderNumber}'}/status
                  </Typography>
                </Box>
              }
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Get order details by order number. All fields are guaranteed to be present.
                  </Typography>
                  <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                    Response:
                  </Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, overflow: 'auto' }}>
                    {JSON.stringify({
                      id: "uuid",
                      created_at: "2024-03-15T10:23:00Z",
                      order_number: "412345001",
                      upi_id: "yourbusiness@upi",
                      amount: 1000.00,
                      status: "PENDING",  // One of: PENDING, PROCESSING, COMPLETED, FAILED
                      utr_number: null,   // Optional: Present after payment
                      user_id: "uuid",    // Auto-set from API key
                      expires_at: "2024-03-15T10:30:00Z"
                    }, null, 2)}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payments
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography component="span" sx={{ 
                    bgcolor: 'success.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem'
                  }}>
                    GET
                  </Typography>
                  <Typography component="span">
                    /payments/{'{orderNumber}'}
                  </Typography>
                </Box>
              }
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Get payment details by order number. Created automatically with each order.
                  </Typography>
                  <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                    Response:
                  </Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, overflow: 'auto' }}>
                    {JSON.stringify({
                      id: "uuid",
                      created_at: "2024-03-15T10:23:00Z",
                      order_number: "412345001",
                      utr_number: null,           // Optional: Set after payment
                      recipient_name: "API Payment", // Auto-set
                      method: "UPI",              // One of: UPI, BANK_TRANSFER, CRYPTO
                      amount: 1000.00,
                      status: "PENDING",          // One of: PENDING, PROCESSING, COMPLETED, FAILED
                      description: "Payment for order 412345001",
                      user_id: "uuid"            // Auto-set from API key
                    }, null, 2)}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default ApiDocs;