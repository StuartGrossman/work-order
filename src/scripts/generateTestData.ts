import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
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

const testItems = [
  {
    name: "Test Item 1",
    description: "First test item",
    quantity: 10,
    price: 29.99,
    createdAt: new Date()
  },
  {
    name: "Test Item 2",
    description: "Second test item",
    quantity: 5,
    price: 49.99,
    createdAt: new Date()
  },
  {
    name: "Test Item 3",
    description: "Third test item",
    quantity: 15,
    price: 19.99,
    createdAt: new Date()
  }
];

async function generateTestData() {
  try {
    const qrCodesCollection = collection(db, 'qrCodes');
    
    for (const item of testItems) {
      const qrCode: QRCode = {
        ...item,
        qrCode: JSON.stringify(item)
      };
      
      await addDoc(qrCodesCollection, qrCode);
      console.log(`Added QR code for ${item.name}`);
    }
    
    console.log('Test data generation completed successfully');
  } catch (error) {
    console.error('Error generating test data:', error);
  }
}

generateTestData(); 