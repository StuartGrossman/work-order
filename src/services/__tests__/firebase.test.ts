import { db, rtdb, analytics } from '../firebase';

describe('Firebase Configuration', () => {
  test('Firestore is initialized', () => {
    expect(db).toBeDefined();
  });

  test('Realtime Database is initialized', () => {
    expect(rtdb).toBeDefined();
  });

  test('Analytics is initialized', () => {
    expect(analytics).toBeDefined();
  });
}); 