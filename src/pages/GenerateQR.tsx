import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Grid, CircularProgress, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import { qrService } from '../services/qrService';
import { QRCode } from '../types/qrCode';

const GenerateQR: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid price');
      }

      // Create QR code data first
      const qrData = {
        name: formData.name,
        price: price,
        createdAt: new Date()
      };

      // Generate a temporary ID for the QR code data
      const tempId = Math.random().toString(36).substring(7);
      const qrCodeString = JSON.stringify({
        url: `${window.location.origin}/id/${tempId}`,
        id: tempId,
        name: formData.name,
        price: price
      });

      // Save to database with the QR code string
      const newQRCode: Omit<QRCode, 'id'> = {
        ...qrData,
        qrCode: qrCodeString
      };

      const id = await qrService.saveQRCode(newQRCode);
      
      // Update the QR code string with the actual ID
      const finalQrCodeString = JSON.stringify({
        url: `${window.location.origin}/id/${id}`,
        id,
        name: formData.name,
        price: price
      });

      // Update the QR code with the final string
      await qrService.updateQRCode(id, { qrCode: finalQrCodeString });
      
      setQrCode(finalQrCodeString);
      setSuccess(true);
      setFormData({ name: '', price: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr-code-${formData.name}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

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
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}>
          <QrCodeIcon sx={{ fontSize: { xs: 36, md: 48 }, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Generate QR Code
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Create a QR code for your inventory item
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 2, md: 4 }
          }}>
            <Box sx={{ 
              flexBasis: { xs: '100%', md: '50%' }, 
              flexGrow: 1,
              minWidth: { xs: '100%', md: '50%' }
            }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  height: '100%',
                  '& .MuiTextField-root': {
                    mb: { xs: 2, md: 3 }
                  }
                }}
              >
                <form onSubmit={handleSubmit} aria-label="QR code generation form">
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    id="name-input"
                    inputProps={{ 
                      "data-testid": "name-input",
                      style: { fontSize: isMobile ? '16px' : 'inherit' } // Prevent zoom on iOS
                    }}
                    error={!!error && error.includes('name')}
                    helperText={error && error.includes('name') ? error : ''}
                  />
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    id="price-input"
                    inputProps={{ 
                      min: "0",
                      step: "0.01",
                      "data-testid": "price-input",
                      style: { fontSize: isMobile ? '16px' : 'inherit' }
                    }}
                    error={!!error && error.includes('price')}
                    helperText={error && error.includes('price') ? error : ''}
                  />
                  <Box sx={{ 
                    mt: { xs: 2, md: 3 }, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 1, md: 2 }
                  }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading || !formData.name || !formData.price}
                      startIcon={loading ? <CircularProgress size={20} /> : <QrCodeIcon />}
                      data-testid="generate-button"
                      sx={{ 
                        height: { xs: '48px', md: '40px' },
                        fontSize: { xs: '1rem', md: '0.875rem' }
                      }}
                    >
                      {loading ? 'Generating...' : 'Generate QR Code'}
                    </Button>
                  </Box>
                </form>
              </Paper>
            </Box>

            <Box sx={{ 
              flexBasis: { xs: '100%', md: '50%' }, 
              flexGrow: 1,
              minWidth: { xs: '100%', md: '50%' }
            }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  minHeight: { xs: '300px', md: '400px' },
                  justifyContent: 'center'
                }}
              >
                {qrCode ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, md: 2 }
                  }}>
                    <QRCodeSVG
                      id="qr-code"
                      value={qrCode}
                      size={isMobile ? 200 : 256}
                      level="H"
                      includeMargin={true}
                      data-testid="qr-code"
                      data-value={qrCode}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDownload}
                      startIcon={<DownloadIcon />}
                      data-testid="download-button"
                      sx={{ 
                        height: { xs: '48px', md: '40px' },
                        fontSize: { xs: '1rem', md: '0.875rem' }
                      }}
                    >
                      Download QR Code
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }} data-testid="placeholder">
                    <QrCodeIcon sx={{ 
                      fontSize: { xs: 48, md: 64 }, 
                      color: 'text.secondary', 
                      mb: { xs: 1, md: 2 } 
                    }} />
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                    >
                      Fill out the form to generate a QR code
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
            QR code generated successfully!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default GenerateQR; 