import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../contexts/CartContext';
import ScanQR from '../ScanQR';

// Mock the html5-qrcode library
jest.mock('html5-qrcode', () => {
  return {
    Html5QrcodeScanner: jest.fn().mockImplementation(() => ({
      render: jest.fn(),
      clear: jest.fn(),
    })),
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ScanQR Component', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <CartProvider>
          <ScanQR />
        </CartProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the scanner component', () => {
    renderComponent();
    expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
    expect(document.getElementById('reader')).toBeInTheDocument();
  });

  it('handles successful QR code scan', async () => {
    renderComponent();
    const testQRData = {
      name: 'Test Item',
      price: 99.99,
    };

    // Simulate successful QR code scan
    const scanner = document.querySelector('#reader');
    if (scanner) {
      const event = new CustomEvent('qrCodeSuccess', {
        detail: JSON.stringify(testQRData),
      });
      scanner.dispatchEvent(event);
    }

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });
  });

  it('handles invalid QR code data', async () => {
    renderComponent();

    // Simulate invalid QR code scan
    const scanner = document.querySelector('#reader');
    if (scanner) {
      const event = new CustomEvent('qrCodeSuccess', {
        detail: 'invalid-json',
      });
      scanner.dispatchEvent(event);
    }

    await waitFor(() => {
      expect(screen.getByText('Invalid QR code format')).toBeInTheDocument();
    });
  });

  it('validates quantity input', async () => {
    renderComponent();
    const testQRData = {
      name: 'Test Item',
      price: 99.99,
    };

    // Simulate successful QR code scan
    const scanner = document.querySelector('#reader');
    if (scanner) {
      const event = new CustomEvent('qrCodeSuccess', {
        detail: JSON.stringify(testQRData),
      });
      scanner.dispatchEvent(event);
    }

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText('Quantity');
    const addToCartButton = screen.getByText('Add to Cart');

    // Test invalid quantity
    fireEvent.change(quantityInput, { target: { value: '0' } });
    fireEvent.click(addToCartButton);
    expect(screen.getByText('Please enter a valid quantity')).toBeInTheDocument();

    // Test valid quantity
    fireEvent.change(quantityInput, { target: { value: '5' } });
    fireEvent.click(addToCartButton);
    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });

  it('adds item to cart with correct quantity', async () => {
    const { container } = renderComponent();
    const testQRData = {
      name: 'Test Item',
      price: 99.99,
    };

    // Simulate successful QR code scan
    const scanner = document.querySelector('#reader');
    if (scanner) {
      const event = new CustomEvent('qrCodeSuccess', {
        detail: JSON.stringify(testQRData),
      });
      scanner.dispatchEvent(event);
    }

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText('Quantity');
    const addToCartButton = screen.getByText('Add to Cart');

    fireEvent.change(quantityInput, { target: { value: '3' } });
    fireEvent.click(addToCartButton);

    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });
}); 