import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

interface RenderOptions {
  withRouter?: boolean;
}

export const renderWithProviders = (ui: React.ReactElement, options: RenderOptions = {}) => {
  const { withRouter = true } = options;
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );

  const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <Wrapper>{children}</Wrapper>
    </BrowserRouter>
  );

  const wrapper = withRouter ? RouterWrapper : Wrapper;

  return render(ui, { wrapper });
}; 