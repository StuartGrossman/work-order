import { screen } from '@testing-library/react';
import App from '../App';
import { renderWithProviders } from '../test-utils';
import { runTestSuite, expectSafe } from '../test-runner';

runTestSuite('App Component', () => {
  const renderApp = () => {
    renderWithProviders(<App />);
  };

  describe('Routing', () => {
    test('renders without crashing', () => {
      renderApp();
      expectSafe(screen.getByText('QR INVENTORY')).toBeInTheDocument();
    });

    test('renders navigation buttons', () => {
      renderApp();
      expectSafe(screen.getByText('Home')).toBeInTheDocument();
      expectSafe(screen.getByText('Generate QR')).toBeInTheDocument();
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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      });
    });
  });
}); 