import { Box, Container, Typography, Card, CardContent, IconButton, Button, TextField } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  return (
    <Box component="main" sx={{ minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>

        {items.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Your cart is empty
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {items.map((item) => (
                <Card key={item.id}>
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
                        {item.description && (
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
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

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
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
                  onClick={() => {
                    // TODO: Implement checkout
                    console.log('Checkout clicked');
                  }}
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