import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC6NFGd0CAAjRFpmwbFtqcbSPtPnXn-1Qs",
  authDomain: "emailsender-44bcc.firebaseapp.com",
  databaseURL: "https://emailsender-44bcc-default-rtdb.firebaseio.com",
  projectId: "emailsender-44bcc",
  storageBucket: "emailsender-44bcc.firebasestorage.app",
  messagingSenderId: "822067962378",
  appId: "1:822067962378:web:5c8a4639f3961d7bcbf5f3",
  measurementId: "G-1SZ0VFS51S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testItems = [
  { name: 'Hammer', price: 15.99 },
  { name: 'Screwdriver Set', price: 24.99 },
  { name: 'Drill', price: 89.99 },
  { name: 'Wrench Set', price: 49.99 },
  { name: 'Safety Gloves', price: 12.99 },
  { name: 'Work Boots', price: 79.99 },
  { name: 'Tool Box', price: 39.99 },
  { name: 'Measuring Tape', price: 9.99 },
  { name: 'Level', price: 19.99 },
  { name: 'Safety Goggles', price: 14.99 }
];

async function generateTestData() {
  try {
    console.log('Starting to generate test data...');
    
    for (const item of testItems) {
      const qrData = {
        name: item.name,
        price: item.price,
        qrCode: JSON.stringify({
          url: `http://localhost:5173/id/${item.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: item.name,
          price: item.price
        }),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'qrCodes'), qrData);
      console.log(`Added ${item.name}`);
    }

    console.log('Test data generation completed successfully!');
  } catch (error) {
    console.error('Error generating test data:', error);
  }
}

generateTestData(); 