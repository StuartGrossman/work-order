import { Box, Container, Typography, Card, CardContent, IconButton, Button, TextField } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  // Log cart state whenever it changes
  console.log('Cart State:', {
    totalItems: items.length,
    totalPrice: total.toFixed(2),
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      amazonUrl: item.amazonUrl,
      subtotal: (item.price * item.quantity).toFixed(2)
    }))
  });

  const handleCheckout = () => {
    console.log('Starting checkout process...');
    
    // Filter items that have Amazon URLs or ASINs
    const amazonItems = items.filter(item => item.amazonUrl);
    console.log('Found Amazon items:', amazonItems.map(item => ({
      name: item.name,
      amazonUrl: item.amazonUrl,
      quantity: item.quantity
    })));
    
    if (amazonItems.length === 0) {
      console.warn('No Amazon items found in cart');
      alert('No Amazon items in cart');
      return;
    }

    // Construct Amazon cart URL with AssociateTag
    let cartUrl = 'https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=your-tag-20';
    console.log('Initial cart URL:', cartUrl);

    amazonItems.forEach((item, index) => {
      // Extract ASIN from Amazon URL or use the value directly if it's already an ASIN
      let asin = item.amazonUrl;
      
      // If it's a full URL, try to extract the ASIN
      if (item.amazonUrl?.includes('amazon.com')) {
        const asinMatch = item.amazonUrl.match(/\/dp\/([A-Z0-9]{10})/);
        if (asinMatch) {
          asin = asinMatch[1];
        }
      }
      
      if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
        console.error('Invalid ASIN format:', {
          itemName: item.name,
          amazonUrl: item.amazonUrl,
          extractedAsin: asin
        });
        return;
      }
      
      console.log('Processing item:', {
        itemName: item.name,
        asin,
        quantity: item.quantity,
        index
      });

      const quantity = item.quantity;
      const itemUrl = `&ASIN.${index + 1}=${asin}&Quantity.${index + 1}=${quantity}`;
      console.log('Adding to URL:', itemUrl);
      
      cartUrl += itemUrl;
    });

    console.log('Final Amazon cart URL:', cartUrl);
    window.open(cartUrl, '_blank');
  };

  const handleQuantityUpdate = (id: string, newQuantity: number) => {
    console.log('Updating quantity:', {
      itemId: id,
      newQuantity,
      currentItem: items.find(item => item.id === id)
    });
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    console.log('Removing item from cart:', {
      itemId: id,
      itemName: itemToRemove?.name,
      itemPrice: itemToRemove?.price
    });
    removeItem(id);
  };

  const handleClearCart = () => {
    console.log('Clearing cart. Current items:', items.length);
    clearCart();
  };

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
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4,
            fontWeight: 600
          }}
        >
          Shopping Cart
        </Typography>

        {items.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center">
                Your cart is empty
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {items.map((item) => (
                <Card key={item.id} elevation={2}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: '4fr 2fr 3fr 2fr 1fr'
                      },
                      gap: 2,
                      alignItems: 'center'
                    }}>
                      <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        {item.amazonUrl && (
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>ASIN:</span>
                            <span style={{ fontFamily: 'monospace' }}>
                              {item.amazonUrl.match(/\/dp\/([A-Z0-9]{10})/)?.[1] || item.amazonUrl}
                            </span>
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body1">
                          ${item.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityUpdate(item.id!, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          type="number"
                          size="small"
                          sx={{ width: 60 }}
                          onChange={(e) => handleQuantityUpdate(item.id!, parseInt(e.target.value) || 1)}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityUpdate(item.id!, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      <Box>
                        <Typography variant="body1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveItem(item.id!)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Box 
              sx={{ 
                mt: 4, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Total: ${total.toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={items.length === 0}
                  onClick={handleCheckout}
                >
                  Checkout on Amazon
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Cart; 