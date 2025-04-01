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
  useMediaQuery,
  Grid
} from '@mui/material';
import { qrService } from '../services/qrService';
import { useCart } from '../contexts/CartContext';
import { QRCode } from '../types/qrCode';
import { QRCodeSVG } from 'qrcode.react';

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
        minHeight: 'calc(100vh - 64px)',
        pt: { xs: 8, sm: 10 }
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !qrCode) {
    return (
      <Container maxWidth="sm" sx={{ pt: { xs: 8, sm: 10 } }}>
        <Alert severity="error">{error || 'QR code not found'}</Alert>
      </Container>
    );
  }

  return (
    <Box 
      component="main"
      sx={{ 
        minHeight: 'calc(100vh - 64px)',
        pt: { xs: 8, sm: 10 },
        pb: 4,
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="lg">
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 4 },
            borderRadius: 2
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box 
                  sx={{ 
                    backgroundColor: 'white',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 1
                  }}
                >
                  <QRCodeSVG
                    value={qrCode.qrCode || JSON.stringify({
                      url: `${window.location.origin}/id/${qrCode.id}`,
                      id: qrCode.id,
                      name: qrCode.name,
                      price: qrCode.price
                    })}
                    size={250}
                    level="H"
                    includeMargin
                  />
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      const url = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${qrCode.name.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  Download QR Code
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                  {qrCode.name}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  ${qrCode.price.toFixed(2)}
                </Typography>
                {qrCode.description && (
                  <Typography variant="body1" color="text.secondary">
                    {qrCode.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    sx={{ width: 120 }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleAddToCart}
                    disabled={!quantity || parseInt(quantity) <= 0}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default QRCodeDetail; 