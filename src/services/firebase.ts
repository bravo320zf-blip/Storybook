import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { Story, Character, StoryboardData, WorldMap, UserConfig } from '../types';

// Default configuration from environment or fallback
const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDITwMz7VLiR-AayS121Ltx7wBwCMnQ05U',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'inkling-writing-desk.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'inkling-writing-desk',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'inkling-writing-desk.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '359467048952',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:359467048952:web:d35b31ca5155c9cfd2c00d',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initFirebase(customConfig?: Partial<typeof defaultFirebaseConfig>) {
  const config = {
    apiKey: customConfig?.apiKey || defaultFirebaseConfig.apiKey,
    authDomain: customConfig?.authDomain || defaultFirebaseConfig.authDomain,
    projectId: customConfig?.projectId || defaultFirebaseConfig.projectId,
    storageBucket: customConfig?.storageBucket || defaultFirebaseConfig.storageBucket,
    messagingSenderId: customConfig?.messagingSenderId || defaultFirebaseConfig.messagingSenderId,
    appId: customConfig?.appId || defaultFirebaseConfig.appId,
  };

  if (!config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    return { app, auth, db };
  } catch (err) {
    console.warn('Firebase initialization note:', err);
    return null;
  }
}

// Auto-initialize if env vars are present
initFirebase();

export const googleProvider = new GoogleAuthProvider();
// Request Google Drive scopes for storing manuscripts and folders
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.setCustomParameters({
  prompt: 'select_account consent',
  access_type: 'offline',
});

/**
 * Signs in with Google via Firebase Auth and retrieves Google Drive Access Token
 */
export async function signInWithGoogle(): Promise<{ user: User; accessToken?: string }> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured yet. Please configure Firebase in Setup.');
  }

  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;

  return {
    user: result.user,
    accessToken,
  };
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured yet. Please configure Firebase in Setup.');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured yet. Please configure Firebase in Setup.');
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOutUser(): Promise<void> {
  if (auth) {
    await fbSignOut(auth);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Firestore persistence helpers
export async function syncStoryToFirestore(userId: string, story: Story): Promise<void> {
  if (!db) return;
  const ref = doc(db, `users/${userId}/stories`, story.id);
  await setDoc(ref, story, { merge: true });
}

export async function loadStoriesFromFirestore(userId: string): Promise<Story[]> {
  if (!db) return [];
  const col = collection(db, `users/${userId}/stories`);
  const snapshot = await getDocs(col);
  return snapshot.docs.map((d) => d.data() as Story);
}

export async function deleteStoryFromFirestore(userId: string, storyId: string): Promise<void> {
  if (!db) return;
  const ref = doc(db, `users/${userId}/stories`, storyId);
  await deleteDoc(ref);
}

export async function saveUserDataToFirestore(
  userId: string,
  data: {
    characters?: Character[];
    storyboards?: Record<string, StoryboardData>;
    maps?: WorldMap[];
  }
): Promise<void> {
  if (!db) return;
  const ref = doc(db, `users/${userId}/workspace`, 'data');
  await setDoc(ref, data, { merge: true });
}

export async function clearUserFirestoreData(userId: string): Promise<void> {
  if (!db) return;
  try {
    const storiesCol = collection(db, `users/${userId}/stories`);
    const storiesSnap = await getDocs(storiesCol);
    for (const d of storiesSnap.docs) {
      await deleteDoc(d.ref);
    }
    const wsRef = doc(db, `users/${userId}/workspace`, 'data');
    await deleteDoc(wsRef);
  } catch (err) {
    console.error('Failed to wipe Firestore user data:', err);
  }
}
