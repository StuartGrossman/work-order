import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { CartProvider } from './contexts/CartContext';

const theme = createTheme();

interface RenderOptions {
  withRouter?: boolean;
}

export const renderWithProviders = (ui: React.ReactElement, options: RenderOptions = {}) => {
  const { withRouter = true } = options;
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>
      <CartProvider>
        {children}
      </CartProvider>
    </ThemeProvider>
  );

  const RouterWrapper = ({ children }: { children: React.ReactNode }) => {
    // Check if the children already have a Router
    const hasRouter = React.Children.toArray(children).some(
      child => React.isValidElement(child) && child.type === BrowserRouter
    );

    if (hasRouter) {
      return <Wrapper>{children}</Wrapper>;
    }

    return (
      <BrowserRouter>
        <Wrapper>{children}</Wrapper>
      </BrowserRouter>
    );
  };

  const wrapper = withRouter ? RouterWrapper : Wrapper;

  return render(ui, { wrapper });
}; 