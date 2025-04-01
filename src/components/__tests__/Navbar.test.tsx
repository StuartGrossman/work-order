import { screen } from '@testing-library/react';
import Navbar from '../Navbar';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';

runTestSuite('Navbar Component', () => {
  const renderNavbar = () => {
    renderWithProviders(<Navbar />);
  };

  describe('Navigation', () => {
    test('renders navbar with title', () => {
      renderNavbar();
      expectSafe(screen.getByText('QR INVENTORY')).toBeInTheDocument();
    });

    test('renders navigation links', () => {
      renderNavbar();
      expectSafe(screen.getByText('Home')).toBeInTheDocument();
      expectSafe(screen.getByText('Generate QR')).toBeInTheDocument();
    });

    test('navigation links have correct href attributes', () => {
      renderNavbar();
      const homeLink = screen.getByText('Home').closest('a');
      const generateLink = screen.getByText('Generate QR').closest('a');
      
      expectSafe(homeLink).toHaveAttribute('href', '/');
      expectSafe(generateLink).toHaveAttribute('href', '/generate-qr');
    });
  });

  describe('Styling', () => {
    test('navbar has correct styling', () => {
      renderNavbar();
      const navbar = screen.getByRole('banner');
      expectSafe(navbar).toHaveStyle({
        position: 'static',
        backgroundColor: expect.stringContaining('rgb'),
        padding: expect.stringContaining('px')
      });
    });

    test('navigation links have correct styling', () => {
      renderNavbar();
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        const styles = window.getComputedStyle(link);
        expectSafe(styles.color).toMatch(/rgb/);
      });
    });
  });
}); 