import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Grid, CircularProgress, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import { qrService } from '../services/qrService';

interface ItemData {
  name: string;
  description: string;
  quantity: string;
  price: string;
}

const GenerateQR: React.FC = () => {
  const [itemData, setItemData] = useState<ItemData>({
    name: '',
    description: '',
    quantity: '',
    price: ''
  });
  const [qrValue, setQrValue] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle empty values
    if (value === '') {
      setItemData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }
    
    // Handle quantity validation
    if (name === 'quantity') {
      // Only allow positive integers
      if (!/^\d+$/.test(value)) {
        return;
      }
      setItemData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }

    // Handle price validation
    if (name === 'price') {
      // Allow decimal numbers with up to 2 decimal places
      if (!/^\d*\.?\d{0,2}$/.test(value)) {
        return;
      }
      // Ensure the value is not negative
      if (parseFloat(value) < 0) {
        return;
      }
      setItemData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }

    // Handle other fields
    setItemData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setSuccess('');
    
    try {
      // Create a JSON string of the item data
      const qrData = JSON.stringify(itemData);
      setQrValue(qrData);

      // Save to Firebase
      await qrService.saveQRCode({
        name: itemData.name,
        quantity: parseInt(itemData.quantity),
        price: parseFloat(itemData.price),
        qrCode: qrData
      });

      setSuccess('QR code generated and saved successfully!');
      handleReset();
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setItemData({
      name: '',
      description: '',
      quantity: '',
      price: ''
    });
    setQrValue('');
  };

  const handleDownload = () => {
    const canvas = document.querySelector('svg');
    if (canvas) {
      const svgData = new XMLSerializer().serializeToString(canvas);
      const canvas2 = document.createElement('canvas');
      const ctx = canvas2.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas2.width = img.width;
        canvas2.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas2.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-code-${itemData.name}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
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
                    label="Item Name"
                    name="name"
                    value={itemData.name}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    id="name-input"
                    inputProps={{ 
                      "data-testid": "name-input",
                      style: { fontSize: isMobile ? '16px' : 'inherit' } // Prevent zoom on iOS
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={itemData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    id="description-input"
                    inputProps={{ 
                      "data-testid": "description-input",
                      style: { fontSize: isMobile ? '16px' : 'inherit' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={itemData.quantity}
                    onChange={handleInputChange}
                    required
                    id="quantity-input"
                    inputProps={{ 
                      min: "0",
                      step: "1",
                      pattern: "\\d*",
                      "data-testid": "quantity-input",
                      style: { fontSize: isMobile ? '16px' : 'inherit' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={itemData.price}
                    onChange={handleInputChange}
                    required
                    id="price-input"
                    inputProps={{ 
                      min: "0",
                      step: "0.01",
                      "data-testid": "price-input",
                      style: { fontSize: isMobile ? '16px' : 'inherit' }
                    }}
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
                      disabled={!itemData.name || !itemData.quantity || !itemData.price || isGenerating}
                      startIcon={isGenerating ? <CircularProgress size={20} /> : <QrCodeIcon />}
                      data-testid="generate-button"
                      sx={{ 
                        height: { xs: '48px', md: '40px' },
                        fontSize: { xs: '1rem', md: '0.875rem' }
                      }}
                    >
                      {isGenerating ? 'Generating...' : 'Generate QR Code'}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={handleReset}
                      fullWidth
                      disabled={isGenerating}
                      data-testid="reset-button"
                      sx={{ 
                        height: { xs: '48px', md: '40px' },
                        fontSize: { xs: '1rem', md: '0.875rem' }
                      }}
                    >
                      Reset
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
                {qrValue ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, md: 2 }
                  }}>
                    <QRCodeSVG
                      value={qrValue}
                      size={isMobile ? 200 : 256}
                      level="H"
                      includeMargin={true}
                      data-testid="qr-code"
                      data-value={qrValue}
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
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar 
          open={!!success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default GenerateQR; 