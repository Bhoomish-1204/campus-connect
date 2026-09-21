export { supabase } from './supabase';
export { 
  auth, 
  db, 
  storage, 
  registerWithEmail, 
  loginWithEmail, 
  loginWithGoogleFirebase,
  signOutFirebase, 
  getFirebaseUserProfile, 
  default as firebaseApp 
} from './firebase';
