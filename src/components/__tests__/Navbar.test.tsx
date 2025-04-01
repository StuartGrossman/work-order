import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';
import Navbar from '../Navbar';

runTestSuite('Navbar Component', () => {
  const renderNavbar = () => {
    renderWithProviders(<Navbar />);
  };

  describe('Navigation Elements', () => {
    test('renders all navigation links', () => {
      renderNavbar();
      expectSafe(screen.getByText('Home')).toBeInTheDocument();
      expectSafe(screen.getByText('Generate QR')).toBeInTheDocument();
      expectSafe(screen.getByText('QR INVENTORY')).toBeInTheDocument();
    });

    test('navigation links have correct href attributes', () => {
      renderNavbar();
      const homeLink = screen.getByText('Home').closest('a');
      const generateQRLink = screen.getByText('Generate QR').closest('a');
      
      expectSafe(homeLink).toHaveAttribute('href', '/');
      expectSafe(generateQRLink).toHaveAttribute('href', '/generate-qr');
    });
  });

  describe('Styling', () => {
    test('navbar has correct styling', () => {
      renderNavbar();
      const navbar = screen.getByRole('navigation');
      expectSafe(navbar).toHaveStyle({
        backgroundColor: expect.any(String),
        padding: expect.any(String),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      });
    });

    test('logo has correct styling', () => {
      renderNavbar();
      const logo = screen.getByText('QR INVENTORY');
      expectSafe(logo).toHaveStyle({
        fontSize: expect.any(String),
        fontWeight: expect.any(String),
        color: expect.any(String)
      });
    });
  });
}); 