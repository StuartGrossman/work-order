import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { useCart } from '../contexts/CartContext';

const Navbar: React.FC = () => {
  const { items } = useCart();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          QR Inventory
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/generate"
            startIcon={<QrCodeIcon />}
          >
            Generate QR
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/cart"
            startIcon={
              <Badge badgeContent={itemCount} color="error">
                <ShoppingCart />
              </Badge>
            }
          >
            Cart
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 