import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { qrService } from '../services/qrService';
import { useCart } from '../contexts/CartContext';
import { QRCode } from '../types/qrCode';

const QRCodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        if (!id) {
          throw new Error('No QR code ID provided');
        }
        const code = await qrService.getQRCodeById(id);
        setQRCode(code);
      } catch (err) {
        setError('Failed to load QR code details');
        console.error('Error fetching QR code:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!qrCode) return;

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    addItem({
      id: qrCode.id!,
      name: qrCode.name,
      price: qrCode.price,
      quantity: quantityNum
    });

    navigate('/cart');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !qrCode) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'QR code not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            textAlign: 'center',
            fontSize: { xs: '1.75rem', md: '2.125rem' }
          }}
        >
          {qrCode.name}
        </Typography>

        <Typography 
          variant="h5" 
          color="primary"
          gutterBottom
          sx={{ 
            textAlign: 'center',
            fontSize: { xs: '1.5rem', md: '1.75rem' }
          }}
        >
          ${qrCode.price.toFixed(2)}
        </Typography>

        <Box sx={{ width: '100%', mt: 3 }}>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            inputProps={{ 
              min: "1",
              "data-testid": "quantity-input",
              style: { fontSize: isMobile ? '16px' : 'inherit' }
            }}
            error={!!error && error.includes('quantity')}
            helperText={error && error.includes('quantity') ? error : ''}
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddToCart}
          fullWidth
          sx={{ 
            mt: 3,
            height: { xs: '48px', md: '40px' },
            fontSize: { xs: '1rem', md: '0.875rem' }
          }}
          data-testid="add-to-cart-button"
        >
          Add to Cart
        </Button>
      </Paper>
    </Container>
  );
};

export default QRCodeDetail; 