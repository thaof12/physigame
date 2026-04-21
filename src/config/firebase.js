import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// FirebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyBSBcSWYJ9JNkUzQatW4JD-As8wbdtsoOw",
  authDomain: "physigame.firebaseapp.com",
  projectId: "physigame",
  storageBucket: "physigame.firebasestorage.app",
  messagingSenderId: "1045625689938",
  appId: "1:1045625689938:web:b68bdcc06b9d9b378f8c8b",
  measurementId: "G-TPNP1D1BJN"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

let analytics = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (err) {
  // Ignored
}

export { analytics };
export default app;