import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';
import QRCodeDetail from '../QRCodeDetail';
import { qrService } from '../../services/qrService';
import { vi } from 'vitest';

// Mock the qrService
vi.mock('../../services/qrService', () => ({
  qrService: {
    getQRCodeById: vi.fn()
  }
}));

const mockQRCode = {
  id: 'test-id',
  name: 'Test Item',
  price: 10.99,
  createdAt: new Date('2024-03-20'),
  qrCode: JSON.stringify({ name: 'Test Item', price: 10.99 })
};

const mockCartContext = {
  items: [],
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  total: 0
};

// Mock the useCart hook
vi.mock('../../contexts/CartContext', () => ({
  useCart: () => mockCartContext,
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock useParams and useNavigate
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'test-id' }),
  useNavigate: () => vi.fn()
}));

runTestSuite('QRCodeDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    test('shows loading spinner while fetching QR code', () => {
      vi.mocked(qrService.getQRCodeById).mockImplementation(() => new Promise(() => {}));
      renderWithProviders(<QRCodeDetail />);
      expectSafe(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    test('displays error message when QR code is not found', async () => {
      vi.mocked(qrService.getQRCodeById).mockRejectedValueOnce(new Error('Not found'));
      renderWithProviders(<QRCodeDetail />);

      await waitFor(() => {
        expectSafe(screen.getByText('Failed to load QR code details')).toBeInTheDocument();
      });
    });
  });

  describe('Item Details', () => {
    test('displays QR code details when loaded', async () => {
      vi.mocked(qrService.getQRCodeById).mockResolvedValueOnce(mockQRCode);
      renderWithProviders(<QRCodeDetail />);

      // Wait for loading to complete
      await waitFor(() => {
        expectSafe(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      // Check for item details
      expectSafe(screen.getByText(mockQRCode.name)).toBeInTheDocument();
      expectSafe(screen.getByText(`$${mockQRCode.price.toFixed(2)}`)).toBeInTheDocument();
    });
  });

  describe('Cart Integration', () => {
    test('adds item to cart with correct quantity', async () => {
      vi.mocked(qrService.getQRCodeById).mockResolvedValueOnce(mockQRCode);
      renderWithProviders(<QRCodeDetail />);

      // Wait for loading to complete
      await waitFor(() => {
        expectSafe(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      // Set quantity
      const quantityInput = screen.getByRole('spinbutton');
      fireEvent.change(quantityInput, { target: { value: '2' } });

      // Add to cart
      const addButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addButton);

      expectSafe(mockCartContext.addItem).toHaveBeenCalledWith({
        id: mockQRCode.id,
        name: mockQRCode.name,
        price: mockQRCode.price,
        quantity: 2
      });
    });

    test('shows error for invalid quantity', async () => {
      vi.mocked(qrService.getQRCodeById).mockResolvedValueOnce(mockQRCode);
      renderWithProviders(<QRCodeDetail />);

      // Wait for loading to complete
      await waitFor(() => {
        expectSafe(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      // Set invalid quantity
      const quantityInput = screen.getByRole('spinbutton');
      fireEvent.change(quantityInput, { target: { value: '0' } });

      // Try to add to cart
      const addButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addButton);

      expectSafe(screen.getByText('Please enter a valid quantity')).toBeInTheDocument();
      expectSafe(mockCartContext.addItem).not.toHaveBeenCalled();
    });
  });
}); 