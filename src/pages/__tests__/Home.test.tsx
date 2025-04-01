import { screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../Home';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';
import { vi } from 'vitest';
import { qrService } from '../../services/qrService';

// Mock the qrService
vi.mock('../../services/qrService', () => ({
  qrService: {
    getAllQRCodes: vi.fn()
  }
}));

// Mock the cart context
vi.mock('../../contexts/CartContext', () => ({
  useCart: vi.fn(),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

runTestSuite('Home Component', () => {
  const mockQRCodes = [
    {
      id: '1',
      name: 'Test Item 1',
      quantity: 5,
      price: 10.99,
      createdAt: new Date('2024-03-20'),
      qrCode: JSON.stringify({ name: 'Test Item 1', quantity: 5, price: 10.99 })
    },
    {
      id: '2',
      name: 'Test Item 2',
      quantity: 3,
      price: 15.50,
      createdAt: new Date('2024-03-19'),
      qrCode: JSON.stringify({ name: 'Test Item 2', quantity: 3, price: 15.50 })
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Loading', () => {
    test('displays loading state while fetching QR codes', () => {
      vi.mocked(qrService.getAllQRCodes).mockImplementation(() => new Promise(() => {}));
      renderWithProviders(<Home />);
      expectSafe(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('displays error message when fetching QR codes fails', async () => {
      vi.mocked(qrService.getAllQRCodes).mockRejectedValueOnce(new Error('Fetch failed'));
      renderWithProviders(<Home />);
      await waitFor(() => {
        expectSafe(screen.getByText(/failed to load qr codes/i)).toBeInTheDocument();
      });
    });

    test('displays empty state message when no QR codes exist', async () => {
      vi.mocked(qrService.getAllQRCodes).mockResolvedValueOnce([]);
      renderWithProviders(<Home />);
      await waitFor(() => {
        expectSafe(screen.getByText(/no qr codes generated yet/i)).toBeInTheDocument();
      });
    });

    test('displays list of QR codes when data is fetched successfully', async () => {
      vi.mocked(qrService.getAllQRCodes).mockResolvedValueOnce(mockQRCodes);
      renderWithProviders(<Home />);
      
      await waitFor(() => {
        expectSafe(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
      
      mockQRCodes.forEach(qrCode => {
        expectSafe(screen.getByText(qrCode.name)).toBeInTheDocument();
        expectSafe(screen.getByText(`Quantity: ${qrCode.quantity}`)).toBeInTheDocument();
        expectSafe(screen.getByText(`Price: $${qrCode.price.toFixed(2)}`)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    test('search input updates on change', () => {
      renderWithProviders(<Home />);
      const searchInput = screen.getByPlaceholderText('Search items...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      expectSafe(searchInput.value).toBe('test search');
    });
  });

  describe('Cart Integration', () => {
    test('displays cart item count', () => {
      renderWithProviders(<Home />);
      const cartCount = screen.getByTestId('cart-count');
      expectSafe(cartCount).toBeInTheDocument();
      expectSafe(cartCount).toHaveTextContent('0');
    });
  });
}); 