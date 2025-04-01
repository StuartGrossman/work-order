import { vi } from 'vitest';

export const mockFirestore = {
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
};

vi.mock('firebase/firestore', () => ({
  collection: mockFirestore.collection,
  addDoc: mockFirestore.addDoc,
  getDocs: mockFirestore.getDocs,
  doc: mockFirestore.doc,
  getDoc: mockFirestore.getDoc,
  updateDoc: mockFirestore.updateDoc,
  deleteDoc: mockFirestore.deleteDoc,
  query: mockFirestore.query,
  orderBy: mockFirestore.orderBy,
  limit: mockFirestore.limit,
  startAfter: mockFirestore.startAfter,
}));

vi.mock('../firebase', () => ({
  db: {},
})); 