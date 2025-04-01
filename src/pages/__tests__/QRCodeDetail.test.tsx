import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';
import QRCodeDetail from '../QRCodeDetail';
import { useCart } from '../../contexts/CartContext';
import { qrService } from '../../services/qrService';
import { vi } from 'vitest';

// Mock the qrService and cart context
vi.mock('../../services/qrService', () => ({
  qrService: {
    getQRCodeById: vi.fn()
  }
}));

vi.mock('../../contexts/CartContext', () => ({
  useCart: vi.fn(),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

runTestSuite('QRCodeDetail Page', () => {
  const mockQRCode = {
    id: '1',
    name: 'Test Item',
    description: 'Test Description',
    quantity: 10,
    category: 'Test Category',
    price: 10.99,
    createdAt: new Date('2024-03-20'),
    qrCode: JSON.stringify({ name: 'Test Item', quantity: 10, price: 10.99 })
  };

  const mockCartContext = {
    items: [],
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    total: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCart).mockReturnValue(mockCartContext);
    vi.mocked(qrService.getQRCodeById).mockResolvedValue(mockQRCode);
  });

  describe('Loading State', () => {
    test('renders loading state initially', () => {
      vi.mocked(qrService.getQRCodeById).mockImplementation(() => new Promise(() => {}));
      renderWithProviders(<QRCodeDetail />);
      expectSafe(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    test('renders error message when item not found', async () => {
      vi.mocked(qrService.getQRCodeById).mockRejectedValue(new Error('Not found'));
      renderWithProviders(<QRCodeDetail />);
      expectSafe(await screen.findByText(/item not found/i)).toBeInTheDocument();
    });
  });

  describe('Item Details', () => {
    test('renders item details when loaded', async () => {
      renderWithProviders(<QRCodeDetail />);
      
      expectSafe(await screen.findByText(mockQRCode.name)).toBeInTheDocument();
      expectSafe(screen.getByText(mockQRCode.description)).toBeInTheDocument();
      expectSafe(screen.getByText(`Quantity: ${mockQRCode.quantity}`)).toBeInTheDocument();
      expectSafe(screen.getByText(`Category: ${mockQRCode.category}`)).toBeInTheDocument();
    });
  });

  describe('Cart Interactions', () => {
    test('can add item to cart', async () => {
      const addItem = vi.fn();
      vi.mocked(useCart).mockReturnValue({ ...mockCartContext, addItem });
      
      renderWithProviders(<QRCodeDetail />);
      
      const quantityInput = await screen.findByRole('spinbutton');
      fireEvent.change(quantityInput, { target: { value: '2' } });
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addToCartButton);
      
      expect(addItem).toHaveBeenCalledWith(expect.objectContaining({
        id: mockQRCode.id,
        name: mockQRCode.name,
        quantity: 2
      }));
    });

    test('add to cart button is disabled when quantity is 0', async () => {
      renderWithProviders(<QRCodeDetail />);
      
      const quantityInput = await screen.findByRole('spinbutton');
      fireEvent.change(quantityInput, { target: { value: '0' } });
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      expectSafe(addToCartButton).toBeDisabled();
    });
  });
}); 