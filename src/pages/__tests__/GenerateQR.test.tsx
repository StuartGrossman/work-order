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

runTestSuite('GenerateQR Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validation', () => {
    test('shows validation errors for empty required fields', async () => {
      renderWithProviders(<GenerateQR />);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      fireEvent.click(submitButton);
      
      expectSafe(await screen.findByText('Name is required')).toBeInTheDocument();
      expectSafe(await screen.findByText('Description is required')).toBeInTheDocument();
      expectSafe(await screen.findByText('Quantity is required')).toBeInTheDocument();
      expectSafe(await screen.findByText('Category is required')).toBeInTheDocument();
    });

    test('validates quantity as a number', () => {
      renderWithProviders(<GenerateQR />);
      const quantityInput = screen.getByLabelText('Quantity *');
      
      fireEvent.change(quantityInput, { target: { value: 'abc' } });
      fireEvent.blur(quantityInput);
      
      expectSafe(screen.getByText('Quantity must be a number')).toBeInTheDocument();
    });
  });

  describe('QR Code Generation', () => {
    test('generates and saves QR code successfully', async () => {
      const mockSaveQRCode = vi.mocked(qrService.saveQRCode);
      mockSaveQRCode.mockResolvedValueOnce('mock-id');
      
      renderWithProviders(<GenerateQR />);
      
      // Fill in the form
      await userEvent.type(screen.getByLabelText('Name *'), 'Test Item');
      await userEvent.type(screen.getByLabelText('Description *'), 'Test Description');
      await userEvent.type(screen.getByLabelText('Quantity *'), '5');
      await userEvent.type(screen.getByLabelText('Category *'), 'Test Category');
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      
      // Wait for the success message
      await waitFor(() => {
        expectSafe(screen.getByText(/qr code generated successfully/i)).toBeInTheDocument();
      });
      
      // Verify the data was saved correctly
      expect(mockSaveQRCode).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Item',
        description: 'Test Description',
        quantity: 5,
        category: 'Test Category'
      }));
    });

    test('handles error when saving QR code fails', async () => {
      const mockSaveQRCode = vi.mocked(qrService.saveQRCode);
      mockSaveQRCode.mockRejectedValueOnce(new Error('Save failed'));
      
      renderWithProviders(<GenerateQR />);
      
      // Fill in the form
      await userEvent.type(screen.getByLabelText('Name *'), 'Test Item');
      await userEvent.type(screen.getByLabelText('Description *'), 'Test Description');
      await userEvent.type(screen.getByLabelText('Quantity *'), '5');
      await userEvent.type(screen.getByLabelText('Category *'), 'Test Category');
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      
      // Wait for the error message
      await waitFor(() => {
        expectSafe(screen.getByText(/failed to generate qr code/i)).toBeInTheDocument();
      });
    });
  });
}); 