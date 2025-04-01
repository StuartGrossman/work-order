import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import GenerateQR from '../GenerateQR';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';
import { qrService } from '../../services/qrService';

// Mock the qrService
vi.mock('../../services/qrService', () => ({
  qrService: {
    saveQRCode: vi.fn()
  }
}));

runTestSuite('GenerateQR Component', () => {
  const renderGenerateQR = () => {
    renderWithProviders(<GenerateQR />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    test('renders all form fields with correct labels', () => {
      renderGenerateQR();
      expectSafe(screen.getByTestId('name-input')).toBeInTheDocument();
      expectSafe(screen.getByTestId('description-input')).toBeInTheDocument();
      expectSafe(screen.getByTestId('quantity-input')).toBeInTheDocument();
      expectSafe(screen.getByTestId('price-input')).toBeInTheDocument();
    });

    test('renders generate and reset buttons', () => {
      renderGenerateQR();
      expectSafe(screen.getByTestId('generate-button')).toBeInTheDocument();
      expectSafe(screen.getByTestId('reset-button')).toBeInTheDocument();
    });

    test('generate button is initially disabled', () => {
      renderGenerateQR();
      expectSafe(screen.getByTestId('generate-button')).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    test('generate button is enabled when all required fields are filled', async () => {
      renderGenerateQR();
      
      const nameInput = screen.getByTestId('name-input');
      const quantityInput = screen.getByTestId('quantity-input');
      const priceInput = screen.getByTestId('price-input');
      
      await userEvent.type(nameInput, 'Test Item');
      await userEvent.type(quantityInput, '10');
      await userEvent.type(priceInput, '99.99');

      expectSafe(screen.getByTestId('generate-button')).not.toBeDisabled();
    });

    test('generate button is disabled when required fields are empty', async () => {
      renderGenerateQR();
      
      const nameInput = screen.getByTestId('name-input');
      const quantityInput = screen.getByTestId('quantity-input');
      
      // Fill only some required fields
      await userEvent.type(nameInput, 'Test Item');
      await userEvent.type(quantityInput, '10');

      expectSafe(screen.getByTestId('generate-button')).toBeDisabled();
    });

    test('quantity field only accepts positive numbers', async () => {
      renderGenerateQR();
      const quantityInput = screen.getByTestId('quantity-input');
      
      // Try to type a negative number
      await userEvent.type(quantityInput, '-5');
      expectSafe(quantityInput).toHaveDisplayValue('');

      // Try to type a valid positive number
      await userEvent.type(quantityInput, '5');
      expectSafe(quantityInput).toHaveDisplayValue('5');

      // Try to type a decimal number
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, '5.5');
      expectSafe(quantityInput).toHaveDisplayValue('5');

      // Try to type a zero
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, '0');
      expectSafe(quantityInput).toHaveDisplayValue('0');
    });

    test('price field accepts decimal numbers', async () => {
      renderGenerateQR();
      const priceInput = screen.getByTestId('price-input');
      
      // Test valid decimal number
      await userEvent.type(priceInput, '10.99');
      expectSafe(priceInput).toHaveDisplayValue('10.99');

      // Test negative number
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, '-10.99');
      expectSafe(priceInput).toHaveDisplayValue('');

      // Test more than 2 decimal places
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, '10.999');
      expectSafe(priceInput).toHaveDisplayValue('10.99');

      // Test zero
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, '0');
      expectSafe(priceInput).toHaveDisplayValue('0');

      // Test zero with decimals
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, '0.00');
      expectSafe(priceInput).toHaveDisplayValue('0.00');
    });
  });

  describe('Form Interactions', () => {
    test('reset button clears all form fields', async () => {
      renderGenerateQR();
      
      // Fill form
      await userEvent.type(screen.getByTestId('name-input'), 'Test Item');
      await userEvent.type(screen.getByTestId('description-input'), 'Test Description');
      await userEvent.type(screen.getByTestId('quantity-input'), '10');
      await userEvent.type(screen.getByTestId('price-input'), '99.99');

      // Click reset
      fireEvent.click(screen.getByTestId('reset-button'));

      // Verify fields are cleared
      await waitFor(() => {
        expectSafe(screen.getByTestId('name-input')).toHaveDisplayValue('');
        expectSafe(screen.getByTestId('description-input')).toHaveDisplayValue('');
        expectSafe(screen.getByTestId('quantity-input')).toHaveDisplayValue('');
        expectSafe(screen.getByTestId('price-input')).toHaveDisplayValue('');
      });

      // Verify generate button is disabled after reset
      expectSafe(screen.getByTestId('generate-button')).toBeDisabled();
    });

    test('generates QR code when form is submitted', async () => {
      renderGenerateQR();
      
      // Fill form
      await userEvent.type(screen.getByTestId('name-input'), 'Test Item');
      await userEvent.type(screen.getByTestId('description-input'), 'Test Description');
      await userEvent.type(screen.getByTestId('quantity-input'), '10');
      await userEvent.type(screen.getByTestId('price-input'), '99.99');

      // Submit form
      fireEvent.click(screen.getByTestId('generate-button'));

      // Wait for QR code to appear
      await waitFor(() => {
        expectSafe(screen.getByTestId('qr-code')).toBeInTheDocument();
      });

      // Verify download button appears
      expectSafe(screen.getByTestId('download-button')).toBeInTheDocument();
    });
  });

  describe('QR Code Display', () => {
    test('shows placeholder when no QR code is generated', () => {
      renderGenerateQR();
      expectSafe(screen.getByTestId('placeholder')).toBeInTheDocument();
      expectSafe(screen.getByText('Fill out the form to generate a QR code')).toBeInTheDocument();
    });

    test('QR code contains correct data', async () => {
      renderGenerateQR();
      
      const testData = {
        name: 'Test Item',
        description: 'Test Description',
        quantity: '10',
        price: '99.99'
      };

      // Fill form
      await userEvent.type(screen.getByTestId('name-input'), testData.name);
      await userEvent.type(screen.getByTestId('description-input'), testData.description);
      await userEvent.type(screen.getByTestId('quantity-input'), testData.quantity);
      await userEvent.type(screen.getByTestId('price-input'), testData.price);

      // Submit form
      fireEvent.click(screen.getByTestId('generate-button'));

      // Wait for QR code to appear and verify its value
      await waitFor(() => {
        const qrCode = screen.getByTestId('qr-code');
        expectSafe(qrCode).toBeInTheDocument();
        expectSafe(qrCode).toHaveAttribute('data-value', JSON.stringify(testData));
      });
    });
  });

  it('generates and saves QR code successfully', async () => {
    const mockSaveQRCode = vi.mocked(qrService.saveQRCode);
    mockSaveQRCode.mockResolvedValueOnce('mock-id');
    
    renderGenerateQR();
    
    // Fill in the form
    await userEvent.type(screen.getByTestId('name-input'), 'Test Item');
    await userEvent.type(screen.getByTestId('description-input'), 'Test Description');
    await userEvent.type(screen.getByTestId('quantity-input'), '5');
    await userEvent.type(screen.getByTestId('price-input'), '10.99');
    
    // Submit the form
    fireEvent.click(screen.getByTestId('generate-button'));
    
    // Verify loading state
    expectSafe(screen.getByText(/generating/i)).toBeInTheDocument();
    
    // Wait for the success message
    await waitFor(() => {
      expectSafe(screen.getByText(/qr code generated and saved successfully/i)).toBeInTheDocument();
    });
    
    // Verify the data was saved correctly
    expect(mockSaveQRCode).toHaveBeenCalledWith({
      name: 'Test Item',
      quantity: 5,
      price: 10.99,
      qrCode: expect.any(String)
    });
    
    // Verify the form was reset
    expectSafe(screen.getByTestId('name-input')).toHaveDisplayValue('');
    expectSafe(screen.getByTestId('description-input')).toHaveDisplayValue('');
    expectSafe(screen.getByTestId('quantity-input')).toHaveDisplayValue('');
    expectSafe(screen.getByTestId('price-input')).toHaveDisplayValue('');
  });

  it('handles error when saving QR code fails', async () => {
    const mockSaveQRCode = vi.mocked(qrService.saveQRCode);
    mockSaveQRCode.mockRejectedValueOnce(new Error('Save failed'));
    
    renderGenerateQR();
    
    // Fill in the form
    await userEvent.type(screen.getByTestId('name-input'), 'Test Item');
    await userEvent.type(screen.getByTestId('quantity-input'), '5');
    await userEvent.type(screen.getByTestId('price-input'), '10.99');
    
    // Submit the form
    fireEvent.click(screen.getByTestId('generate-button'));
    
    // Wait for the error message
    await waitFor(() => {
      expectSafe(screen.getByText(/failed to generate qr code/i)).toBeInTheDocument();
    });
  });

  it('resets the form when reset button is clicked', async () => {
    renderGenerateQR();
    
    // Fill in the form
    await userEvent.type(screen.getByTestId('name-input'), 'Test Item');
    await userEvent.type(screen.getByTestId('quantity-input'), '5');
    await userEvent.type(screen.getByTestId('price-input'), '10.99');
    
    // Click reset button
    fireEvent.click(screen.getByTestId('reset-button'));
    
    // Verify all fields are cleared
    expectSafe(screen.getByTestId('name-input')).toHaveDisplayValue('');
    expectSafe(screen.getByTestId('description-input')).toHaveDisplayValue('');
    expectSafe(screen.getByTestId('quantity-input')).toHaveDisplayValue('');
    expectSafe(screen.getByTestId('price-input')).toHaveDisplayValue('');
  });

  it('disables generate button when required fields are empty', async () => {
    renderGenerateQR();
    const generateButton = screen.getByTestId('generate-button');
    
    // Initially disabled
    expectSafe(generateButton).toBeDisabled();
    
    // Fill in only name
    await userEvent.type(screen.getByTestId('name-input'), 'Test Item');
    expectSafe(generateButton).toBeDisabled();
    
    // Fill in quantity
    await userEvent.type(screen.getByTestId('quantity-input'), '5');
    expectSafe(generateButton).toBeDisabled();
    
    // Fill in price
    await userEvent.type(screen.getByTestId('price-input'), '10.99');
    expectSafe(generateButton).not.toBeDisabled();
  });
}); 