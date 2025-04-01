import { screen } from '@testing-library/react';
import App from '../App';
import { renderWithProviders } from '../test-utils';
import { runTestSuite, expectSafe } from '../test-runner';

runTestSuite('App Component', () => {
  const renderApp = () => {
    renderWithProviders(<App />, { withRouter: false });
  };

  describe('Routing', () => {
    test('renders without crashing', () => {
      renderApp();
      expectSafe(screen.getByText('QR Inventory')).toBeInTheDocument();
    });

    test('renders navigation buttons', () => {
      renderApp();
      expectSafe(screen.getByText('Generate QR')).toBeInTheDocument();
      expectSafe(screen.getByText('Cart')).toBeInTheDocument();
    });

    test('renders main content', () => {
      renderApp();
      expectSafe(screen.getByText('Welcome to QR Inventory System')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    test('app has correct layout structure', () => {
      renderApp();
      const appContainer = screen.getByRole('main');
      expectSafe(appContainer).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      });
    });
  });
}); 