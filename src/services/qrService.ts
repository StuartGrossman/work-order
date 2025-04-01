import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { QRCode } from '../types/qrCode';

const firebaseConfig = {
  apiKey: "AIzaSyDxGXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX",
  authDomain: "qr-inventory-system.firebaseapp.com",
  projectId: "qr-inventory-system",
  storageBucket: "qr-inventory-system.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const qrService = {
  // Save a new QR code
  async saveQRCode(qrCode: Omit<QRCode, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'qrCodes'), qrCode);
      return docRef.id;
    } catch (error) {
      console.error('Error saving QR code:', error);
      throw new Error('Failed to save QR code');
    }
  },

  // Get all QR codes
  async getAllQRCodes(): Promise<QRCode[]> {
    try {
      const qrCodesRef = collection(db, 'qrCodes');
      const q = query(qrCodesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QRCode[];
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      throw new Error('Failed to fetch QR codes');
    }
  }
}; 