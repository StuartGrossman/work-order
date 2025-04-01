import { screen, fireEvent, waitFor } from '@testing-library/react';
import GenerateQR from '../GenerateQR';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';
import { vi } from 'vitest';
import { qrService } from '../../services/qrService';
import userEvent from '@testing-library/user-event';

// Mock the qrService
vi.mock('../../services/qrService', () => ({
  qrService: {
    saveQRCode: vi.fn(),
    updateQRCode: vi.fn()
  }
}));

runTestSuite('GenerateQR Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validation', () => {
    test('shows validation errors for empty required fields', async () => {
      renderWithProviders(<GenerateQR />);
      
      const submitButton = screen.getByRole('button', { name: /generate qr code/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expectSafe(screen.getByText(/name is required/i)).toBeInTheDocument();
        expectSafe(screen.getByText(/price is required/i)).toBeInTheDocument();
      });
    });

    test('shows validation error for invalid price', async () => {
      renderWithProviders(<GenerateQR />);
      
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Item');
      await userEvent.type(screen.getByLabelText(/price/i), '-10');
      
      const submitButton = screen.getByRole('button', { name: /generate qr code/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expectSafe(screen.getByText(/price must be greater than 0/i)).toBeInTheDocument();
      });
    });
  });

  describe('QR Code Generation', () => {
    test('successfully generates and saves a QR code', async () => {
      const mockId = 'test-id';
      vi.mocked(qrService.saveQRCode).mockResolvedValueOnce(mockId);
      vi.mocked(qrService.updateQRCode).mockResolvedValueOnce(undefined);

      renderWithProviders(<GenerateQR />);
      
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Item');
      await userEvent.type(screen.getByLabelText(/price/i), '10.99');
      
      const submitButton = screen.getByRole('button', { name: /generate qr code/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expectSafe(qrService.saveQRCode).toHaveBeenCalled();
        expectSafe(qrService.updateQRCode).toHaveBeenCalled();
        expectSafe(screen.getByText(/qr code generated successfully/i)).toBeInTheDocument();
      });
    });

    test('shows error message when QR code generation fails', async () => {
      vi.mocked(qrService.saveQRCode).mockRejectedValueOnce(new Error('Save failed'));

      renderWithProviders(<GenerateQR />);
      
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Item');
      await userEvent.type(screen.getByLabelText(/price/i), '10.99');
      
      const submitButton = screen.getByRole('button', { name: /generate qr code/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expectSafe(screen.getByText(/failed to generate qr code/i)).toBeInTheDocument();
      });
    });
  });
}); 