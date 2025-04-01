import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { QRCode } from '../types/qrCode';
import { db } from './firebase';

console.log('Using Firestore instance');

// Cache for QR codes
const cache = new Map<string, { data: QRCode[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const qrService = {
  // Save a new QR code
  async saveQRCode(qrCode: Omit<QRCode, 'id'>): Promise<string> {
    console.log('Saving QR code:', { name: qrCode.name, price: qrCode.price });
    try {
      const docRef = await addDoc(collection(db, 'qrCodes'), {
        ...qrCode,
        createdAt: new Date()
      });
      console.log('QR code saved successfully:', { id: docRef.id });
      cache.clear();
      console.log('Cache cleared after save');
      return docRef.id;
    } catch (error) {
      console.error('Error saving QR code:', error);
      throw new Error('Failed to save QR code');
    }
  },

  // Get all QR codes
  async getAllQRCodes(): Promise<QRCode[]> {
    console.log('Getting all QR codes');
    try {
      const cacheKey = 'all';
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached QR codes:', { count: cached.data.length });
        return cached.data;
      }

      console.log('Cache miss, fetching from Firestore');
      const qrCodesRef = collection(db, 'qrCodes');
      const q = query(qrCodesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const codes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QRCode[];

      console.log('Fetched QR codes:', { count: codes.length });
      cache.set(cacheKey, { data: codes, timestamp: Date.now() });
      console.log('Updated cache with new data');
      return codes;
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      throw new Error('Failed to fetch QR codes');
    }
  },

  async getPaginatedQRCodes(pageSize: number, startAfterDoc: QueryDocumentSnapshot | null = null) {
    console.log('Getting paginated QR codes:', { pageSize, hasStartAfter: !!startAfterDoc });
    try {
      const qrCodesRef = collection(db, 'qrCodes');
      let q = query(
        qrCodesRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize + 1)
      );

      if (startAfterDoc) {
        console.log('Using startAfter document:', { id: startAfterDoc.id });
        q = query(q, startAfter(startAfterDoc));
      }

      console.log('Executing Firestore query');
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      console.log('Query results:', { totalDocs: docs.length });

      const hasMoreDocs = docs.length > pageSize;
      const codesData = docs.slice(0, pageSize).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QRCode[];

      const result = {
        codes: codesData,
        lastVisible: docs.length > 0 ? docs[docs.length - 1] : null,
        hasMoreDocs
      };

      console.log('Pagination result:', {
        codesCount: codesData.length,
        hasMore: hasMoreDocs,
        hasLastVisible: !!result.lastVisible
      });

      return result;
    } catch (error) {
      console.error('Error fetching paginated QR codes:', error);
      throw new Error('Failed to fetch QR codes');
    }
  },

  async getQRCodeById(id: string): Promise<QRCode> {
    console.log('Getting QR code by ID:', { id });
    try {
      const docRef = doc(db, 'qrCodes', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('QR code not found:', { id });
        throw new Error('QR code not found');
      }

      const data = docSnap.data();
      console.log('Found QR code:', { id, name: data.name });
      return {
        id: docSnap.id,
        ...data
      } as QRCode;
    } catch (error) {
      console.error('Error fetching QR code:', error);
      throw new Error('Failed to fetch QR code');
    }
  },

  async updateQRCode(id: string, data: Partial<QRCode>): Promise<void> {
    console.log('Updating QR code:', { id, updateData: data });
    try {
      const docRef = doc(db, 'qrCodes', id);
      await updateDoc(docRef, data);
      console.log('QR code updated successfully:', { id });
      cache.clear();
      console.log('Cache cleared after update');
    } catch (error) {
      console.error('Error updating QR code:', error);
      throw new Error('Failed to update QR code');
    }
  },

  async deleteQRCode(id: string): Promise<void> {
    console.log('Deleting QR code:', { id });
    try {
      const docRef = doc(db, 'qrCodes', id);
      await deleteDoc(docRef);
      console.log('QR code deleted successfully:', { id });
      cache.clear();
      console.log('Cache cleared after delete');
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw new Error('Failed to delete QR code');
    }
  }
}; 