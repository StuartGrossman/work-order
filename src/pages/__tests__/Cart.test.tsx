import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';
import Cart from '../Cart';
import { vi } from 'vitest';
import { QRCode } from '../../types/qrCode';

const mockCartItems: QRCode[] = [
  {
    id: '1',
    name: 'Test Item 1',
    price: 10.99,
    createdAt: new Date('2024-03-20'),
    qrCode: JSON.stringify({ name: 'Test Item 1', price: 10.99 })
  },
  {
    id: '2',
    name: 'Test Item 2',
    price: 15.50,
    createdAt: new Date('2024-03-19'),
    qrCode: JSON.stringify({ name: 'Test Item 2', price: 15.50 })
  }
];

const mockCartContext = {
  items: mockCartItems.map(item => ({ ...item, quantity: 1 })),
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  total: mockCartItems.reduce((sum, item) => sum + item.price, 0)
};

// Mock the useCart hook
vi.mock('../../contexts/CartContext', () => ({
  useCart: () => mockCartContext,
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

runTestSuite('Cart Component', () => {
  describe('Empty Cart', () => {
    test('displays empty cart message when no items', () => {
      vi.mocked(mockCartContext.items).length = 0;
      renderWithProviders(<Cart />);
      expectSafe(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });

  describe('Cart with Items', () => {
    test('displays cart items and total', () => {
      vi.mocked(mockCartContext.items).length = mockCartItems.length;
      renderWithProviders(<Cart />);

      mockCartItems.forEach(item => {
        expectSafe(screen.getByText(item.name)).toBeInTheDocument();
        expectSafe(screen.getByText(`$${item.price.toFixed(2)}`)).toBeInTheDocument();
      });

      expectSafe(screen.getByText(`$${mockCartContext.total.toFixed(2)}`)).toBeInTheDocument();
    });

    test('updates item quantity', () => {
      renderWithProviders(<Cart />);

      const quantityInput = screen.getByLabelText(/quantity/i);
      fireEvent.change(quantityInput, { target: { value: '2' } });

      expectSafe(mockCartContext.updateQuantity).toHaveBeenCalledWith(mockCartItems[0].id, 2);
    });

    test('removes item from cart', () => {
      renderWithProviders(<Cart />);

      const removeButton = screen.getByLabelText(/remove/i);
      fireEvent.click(removeButton);

      expectSafe(mockCartContext.removeItem).toHaveBeenCalledWith(mockCartItems[0].id);
    });

    test('clears entire cart', () => {
      renderWithProviders(<Cart />);

      const clearButton = screen.getByRole('button', { name: /clear cart/i });
      fireEvent.click(clearButton);

      expectSafe(mockCartContext.clearCart).toHaveBeenCalled();
    });
  });
}); 