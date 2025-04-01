import { describe, it, expect, beforeEach, vi } from 'vitest';
import { qrService } from '../qrService';
import { mockFirestore } from '../../test/mocks/firebase';

describe('QR Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save and retrieve a QR code', async () => {
    const testQRCode = {
      name: 'Test Item',
      price: 99.99,
      createdAt: new Date(),
      qrCode: JSON.stringify({
        url: 'http://localhost:5173/id/test-item',
        name: 'Test Item',
        price: 99.99
      })
    };

    // Mock addDoc response
    const mockDocRef = { id: 'test-id' };
    mockFirestore.addDoc.mockResolvedValueOnce(mockDocRef);

    // Mock getDoc response
    const mockDocSnap = {
      exists: () => true,
      id: 'test-id',
      data: () => testQRCode
    };
    mockFirestore.getDoc.mockResolvedValueOnce(mockDocSnap);

    // Save QR code
    const id = await qrService.saveQRCode(testQRCode);
    expect(id).toBe('test-id');

    // Verify addDoc was called with correct arguments
    expect(mockFirestore.collection).toHaveBeenCalledWith(expect.anything(), 'qrCodes');
    expect(mockFirestore.addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining(testQRCode));

    // Retrieve QR code
    const savedQRCode = await qrService.getQRCodeById(id);
    expect(savedQRCode).toMatchObject({
      id: 'test-id',
      name: testQRCode.name,
      price: testQRCode.price
    });

    // Verify getDoc was called with correct arguments
    expect(mockFirestore.doc).toHaveBeenCalledWith(expect.anything(), 'qrCodes', id);
    expect(mockFirestore.getDoc).toHaveBeenCalled();
  });

  it('should handle invalid input', async () => {
    const invalidQRCode = {
      name: '',
      price: -1,
      createdAt: new Date(),
      qrCode: ''
    };

    // Mock addDoc to throw an error
    mockFirestore.addDoc.mockRejectedValueOnce(new Error('Invalid input'));

    await expect(qrService.saveQRCode(invalidQRCode)).rejects.toThrow('Failed to save QR code');
  });
}); 