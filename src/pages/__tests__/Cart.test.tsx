import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';
import Cart from '../Cart';
import { useCart } from '../../contexts/CartContext';
import { vi } from 'vitest';

// Create a mock context module
vi.mock('../../contexts/CartContext', () => ({
  useCart: vi.fn(),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

runTestSuite('Cart Page', () => {
  const mockCartItems = [
    {
      id: '1',
      name: 'Test Item 1',
      quantity: 2,
      price: 10.99,
      category: 'Test Category',
      createdAt: new Date('2024-03-20'),
      qrCode: JSON.stringify({ name: 'Test Item 1', quantity: 2, price: 10.99 })
    }
  ];

  const mockCartContext = {
    items: mockCartItems,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    total: mockCartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  };

  beforeEach(() => {
    vi.mocked(useCart).mockReturnValue(mockCartContext);
  });

  describe('Empty Cart', () => {
    test('renders empty cart message when cart is empty', () => {
      vi.mocked(useCart).mockReturnValue({ ...mockCartContext, items: [] });
      renderWithProviders(<Cart />);
      expectSafe(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expectSafe(screen.getByText('Return to Shopping')).toBeInTheDocument();
    });
  });

  describe('Cart with Items', () => {
    test('renders cart items and total', () => {
      renderWithProviders(<Cart />);
      
      // Check if item is displayed
      expectSafe(screen.getByText('Test Item 1')).toBeInTheDocument();
      expectSafe(screen.getByText('2')).toBeInTheDocument();
      expectSafe(screen.getByText('$21.98')).toBeInTheDocument(); // 2 * $10.99
    });

    test('can update item quantity', () => {
      const updateQuantity = vi.fn();
      vi.mocked(useCart).mockReturnValue({ ...mockCartContext, updateQuantity });
      renderWithProviders(<Cart />);
      
      const quantityInput = screen.getByRole('spinbutton');
      fireEvent.change(quantityInput, { target: { value: '3' } });
      
      expect(updateQuantity).toHaveBeenCalledWith('1', 3);
    });

    test('can remove item from cart', () => {
      const removeItem = vi.fn();
      vi.mocked(useCart).mockReturnValue({ ...mockCartContext, removeItem });
      renderWithProviders(<Cart />);
      
      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);
      
      expect(removeItem).toHaveBeenCalledWith('1');
    });
  });

  describe('Cart Actions', () => {
    test('checkout button is enabled with items', () => {
      renderWithProviders(<Cart />);
      const checkoutButton = screen.getByRole('button', { name: /checkout/i });
      expectSafe(checkoutButton).not.toBeDisabled();
    });

    test('checkout button is disabled when empty', () => {
      vi.mocked(useCart).mockReturnValue({ ...mockCartContext, items: [] });
      renderWithProviders(<Cart />);
      const checkoutButton = screen.getByRole('button', { name: /checkout/i });
      expectSafe(checkoutButton).toBeDisabled();
    });
  });
}); 