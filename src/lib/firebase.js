import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC8qvY9BgI5Y21zxezvFnInLGli1MUTHws",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campus-connect-e5c19.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://campus-connect-e5c19-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campus-connect-e5c19",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campus-connect-e5c19.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "308422913367",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:308422913367:web:0e13b5f905170f584fe212",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SNGPS0XJ0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

/**
 * Register a user with Email and Password & create user profile document in Firestore
 */
export async function registerWithEmail(email, password, fullName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (fullName) {
    await updateProfile(user, { displayName: fullName });
  }

  // Create profile in Firestore
  const profileRef = doc(db, 'profiles', user.uid);
  const profileData = {
    id: user.uid,
    email: user.email,
    full_name: fullName || email.split('@')[0],
    role: 'student',
    created_at: new Date().toISOString()
  };
  await setDoc(profileRef, profileData, { merge: true });

  return { user, profile: profileData };
}

/**
 * Login user with Email and Password
 */
export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Login user with Google OAuth (Firebase)
 */
export async function loginWithGoogleFirebase() {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  const profileRef = doc(db, 'profiles', user.uid);
  const profileData = {
    id: user.uid,
    email: user.email,
    full_name: user.displayName || user.email.split('@')[0],
    role: 'student',
    created_at: new Date().toISOString()
  };
  await setDoc(profileRef, profileData, { merge: true });

  return user;
}

/**
 * Sign out current Firebase user
 */
export async function signOutFirebase() {
  return await firebaseSignOut(auth);
}

/**
 * Get user profile from Firestore
 */
export async function getFirebaseUserProfile(uid) {
  if (!uid) return null;
  const profileRef = doc(db, 'profiles', uid);
  const snapshot = await getDoc(profileRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

export default app;
