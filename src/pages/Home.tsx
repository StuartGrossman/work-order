import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, useTheme, useMediaQuery, CircularProgress, Alert, Button, Skeleton } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Download as DownloadIcon } from '@mui/icons-material';
import { qrService } from '../services/qrService';
import { QRCodeSVG } from 'qrcode.react';
import { QRCode } from '../types/qrCode';

const ITEMS_PER_PAGE = 12;

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  useEffect(() => {
    console.log('Home component mounted');
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async (loadMore = false) => {
    console.log('Fetching QR codes...', { loadMore, lastDoc: !!lastDoc });
    try {
      if (loadMore) {
        setLoadingMore(true);
        console.log('Loading more items...');
      } else {
        setLoading(true);
        console.log('Initial load...');
      }
      setError(null);

      const result = await qrService.getPaginatedQRCodes(ITEMS_PER_PAGE, lastDoc);
      console.log('Fetch result:', {
        codesReceived: result.codes.length,
        hasMore: result.hasMoreDocs,
        hasLastVisible: !!result.lastVisible
      });
      
      setQrCodes(prev => {
        const newCodes = loadMore ? [...prev, ...result.codes] : result.codes;
        console.log('Updated QR codes:', {
          previousCount: prev.length,
          newCount: newCodes.length,
          loadMore
        });
        return newCodes;
      });
      
      setLastDoc(result.lastVisible);
      setHasMore(result.hasMoreDocs);
    } catch (err) {
      console.error('Error in fetchQRCodes:', err);
      setError('Failed to load QR codes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      console.log('Fetch completed', {
        loading: false,
        loadingMore: false,
        totalCodes: qrCodes.length,
        hasMore
      });
    }
  };

  const handleDownload = (qrCode: QRCode) => {
    console.log('Downloading QR code:', { id: qrCode.id, name: qrCode.name });
    const canvas = document.getElementById(`qr-${qrCode.id}`) as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found:', `qr-${qrCode.id}`);
      return;
    }

    try {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${qrCode.name.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('QR code downloaded successfully:', qrCode.name);
    } catch (err) {
      console.error('Error downloading QR code:', err);
    }
  };

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

  console.log('Rendering Home component:', {
    codesCount: qrCodes.length,
    loading,
    loadingMore,
    hasMore,
    error
  });

  if (loading && !loadingMore) {
    console.log('Rendering loading skeletons');
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
            
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Grid container spacing={3}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Grid item key={index} xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Skeleton variant="rectangular" height={200} />
                        <Skeleton variant="text" sx={{ mt: 1 }} />
                        <Skeleton variant="text" width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
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
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

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
          
          {qrCodes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No QR codes generated yet. Create your first QR code to get started!
            </Alert>
          ) : (
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Grid container spacing={3}>
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 6 }).map((_, index) => (
                    <Grid item key={index} xs={12} sm={6} md={4}>
                      <Card>
                        <CardContent>
                          <Skeleton variant="rectangular" height={200} />
                          <Skeleton variant="text" sx={{ mt: 1 }} />
                          <Skeleton variant="text" width="60%" />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  // QR code cards
                  qrCodes.map((code) => (
                    <Grid item key={code.id} xs={12} sm={6} md={4}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'center',
                              mb: 2,
                              backgroundColor: 'white',
                              p: 2,
                              borderRadius: 1
                            }}
                          >
                            <QRCodeSVG
                              id={`qr-${code.id}`}
                              value={code.qrCode || JSON.stringify({
                                url: `${window.location.origin}/id/${code.id}`,
                                id: code.id,
                                name: code.name,
                                price: code.price
                              })}
                              size={150}
                              level="H"
                              includeMargin
                            />
                          </Box>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {code.name}
                          </Typography>
                          <Typography variant="body1" color="primary" gutterBottom>
                            ${code.price.toFixed(2)}
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(code)}
                            sx={{ mt: 'auto' }}
                          >
                            Download QR
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </Container>
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

        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => fetchQRCodes(true)}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={20} /> : null}
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home; 