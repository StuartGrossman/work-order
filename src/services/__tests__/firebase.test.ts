import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { mockFirestore } from '../../test/mocks/firebase';

describe('Firebase Configuration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('Firestore is initialized', () => {
    expect(db).toBeDefined();
  });

  it('Can add and retrieve data from Firestore', async () => {
    // Test data
    const testData = {
      name: 'Test Item',
      price: 99.99,
      qrCode: JSON.stringify({
        url: 'http://localhost:5173/id/test-item',
        name: 'Test Item',
        price: 99.99
      }),
      createdAt: new Date()
    };

    // Mock addDoc response
    const mockDocRef = { id: 'test-id' };
    mockFirestore.addDoc.mockResolvedValueOnce(mockDocRef);

    // Mock getDocs response
    const mockQuerySnapshot = {
      docs: [
        {
          id: 'test-id',
          data: () => testData
        }
      ]
    };
    mockFirestore.getDocs.mockResolvedValueOnce(mockQuerySnapshot);

    // Add test data
    const docRef = await addDoc(collection(db, 'qrCodes'), testData);
    expect(docRef.id).toBe('test-id');

    // Verify addDoc was called with correct arguments
    expect(mockFirestore.collection).toHaveBeenCalledWith(db, 'qrCodes');
    expect(mockFirestore.addDoc).toHaveBeenCalledWith(undefined, testData);

    // Retrieve test data
    const querySnapshot = await getDocs(collection(db, 'qrCodes'));
    const foundDoc = querySnapshot.docs.find(doc => doc.id === docRef.id);
    expect(foundDoc).toBeDefined();
    expect(foundDoc?.data()).toMatchObject({
      name: testData.name,
      price: testData.price
    });

    // Verify getDocs was called with correct arguments
    expect(mockFirestore.collection).toHaveBeenCalledWith(db, 'qrCodes');
    expect(mockFirestore.getDocs).toHaveBeenCalled();

    // Mock deleteDoc
    mockFirestore.deleteDoc.mockResolvedValueOnce(undefined);

    // Clean up
    await deleteDoc(doc(db, 'qrCodes', docRef.id));

    // Verify deleteDoc was called with correct arguments
    expect(mockFirestore.doc).toHaveBeenCalledWith(db, 'qrCodes', docRef.id);
    expect(mockFirestore.deleteDoc).toHaveBeenCalled();
  });
}); 