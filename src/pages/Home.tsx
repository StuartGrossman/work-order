import { Container, Typography, Box, Paper, Grid, Card, CardContent, useTheme, useMediaQuery, CircularProgress, Alert } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useEffect, useState } from 'react';
import { qrService, QRCodeData } from '../services/qrService';
import { QRCodeSVG } from 'qrcode.react';
import { QRCode } from '../types/qrCode';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const codes = await qrService.getAllQRCodes();
        setQrCodes(codes);
      } catch (err) {
        setError('Failed to load QR codes');
        console.error('Error fetching QR codes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, []);

  const features = [
    {
      icon: <QrCodeIcon sx={{ fontSize: { xs: 48, md: 60 } }} />,
      title: 'Generate QR Codes',
      description: 'Create unique QR codes for your inventory items with just a few clicks.'
    },
    {
      icon: <ShoppingCartIcon sx={{ fontSize: { xs: 48, md: 60 } }} />,
      title: 'Manage Cart',
      description: 'Easily add and remove items from your cart as you scan QR codes.'
    },
    {
      icon: <InventoryIcon sx={{ fontSize: { xs: 48, md: 60 } }} />,
      title: 'Track Inventory',
      description: 'Keep track of your inventory in real-time with our QR code system.'
    }
  ];

  return (
    <Box 
      role="main"
      sx={{ 
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'background.default',
        py: { xs: 2, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Hero Section */}
        <Box
          component="section"
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            py: { xs: 4, md: 8 },
            px: { xs: 2, md: 4 },
            textAlign: 'center',
            borderRadius: 2,
            mb: { xs: 4, md: 6 },
            width: '100%'
          }}
          data-testid="hero-section"
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', md: '3.75rem' },
              lineHeight: { xs: 1.2, md: 1.1 }
            }}
          >
            Welcome to QR Inventory System
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              lineHeight: { xs: 1.4, md: 1.2 }
            }}
          >
            Streamline your inventory management with QR codes
          </Typography>
        </Box>

        {/* QR Codes List */}
        <Box sx={{ width: '100%', mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              textAlign: 'center',
              mb: 3,
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            Generated QR Codes
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : qrCodes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No QR codes generated yet. Create your first QR code to get started!
            </Alert>
          ) : (
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: { xs: 2, md: 3 },
                width: '100%',
                px: { xs: 1, md: 0 }
              }}
            >
              {qrCodes.map((qrCode) => (
                <Box 
                  key={qrCode.id} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center'
                  }}
                >
                  <Card 
                    sx={{ 
                      width: '100%',
                      maxWidth: 350,
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardContent sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: { xs: 2, md: 3 }
                    }}>
                      <Box sx={{ mb: 2 }}>
                        <QRCodeSVG value={qrCode.qrCode} size={200} />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {qrCode.name}
                      </Typography>
                      {qrCode.description && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {qrCode.description}
                        </Typography>
                      )}
                      <Typography variant="body1">
                        Quantity: {qrCode.quantity}
                      </Typography>
                      <Typography variant="body1">
                        Price: ${qrCode.price.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Created: {new Date(qrCode.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Features Grid */}
        <Box sx={{ width: '100%' }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              textAlign: 'center',
              mb: 3,
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            Features
          </Typography>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 2, md: 4 },
              maxWidth: '1200px', 
              width: '100%', 
              justifyContent: 'center',
              px: { xs: 1, md: 0 }
            }}
          >
            {features.map((feature, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center'
                }}
              >
                <Card 
                  role="article"
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    maxWidth: { xs: '100%', md: '350px' },
                    width: '100%',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent 
                    sx={{ 
                      textAlign: 'center', 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: { xs: 2, md: 3 }
                    }}
                  >
                    <Box sx={{ color: 'primary.main', mb: { xs: 1, md: 2 } }}>
                      {feature.icon}
                    </Box>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="h2"
                      sx={{ 
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        mb: { xs: 1, md: 2 }
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.875rem', md: '1rem' }
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 