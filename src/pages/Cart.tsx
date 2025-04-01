import { Box, Container, Typography, Card, CardContent, IconButton, Button, TextField } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  return (
    <Box 
      component="main" 
      sx={{ 
        minHeight: 'calc(100vh - 64px)',
        pt: { xs: 8, sm: 10 }, // Add more padding at the top
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
                      </Box>
                      <Box>
                        <Typography variant="body1">
                          ${item.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          type="number"
                          size="small"
                          sx={{ width: 60 }}
                          onChange={(e) => updateQuantity(item.id!, parseInt(e.target.value) || 1)}
                        />
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id!, item.quantity + 1)}
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
                          onClick={() => removeItem(item.id!)}
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
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={items.length === 0}
                >
                  Checkout
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