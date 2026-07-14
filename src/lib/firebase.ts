// ============================================================
// OmniFlow - Firebase Configuration & Sync
// ============================================================

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  enableIndexedDbPersistence,
  type Firestore,
} from 'firebase/firestore';
import type { OmniItem } from '../types';
import { db as localDb, upsertItems } from './db';

// Firebase config loaded from env variables (set in Netlify Dashboard)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseInitialized = false;

export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

export function initFirebase() {
  if (firebaseInitialized || !isFirebaseConfigured()) return;
  try {
    app = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(app);
    // Enable offline persistence
    enableIndexedDbPersistence(firestoreDb).catch(err => {
      console.warn('Firestore offline persistence not available:', err.code);
    });
    firebaseInitialized = true;
  } catch (e) {
    console.error('Firebase init failed:', e);
  }
}

export function getFirebaseAuth() {
  if (!app) initFirebase();
  if (!app) return null;
  return getAuth(app);
}

export function getFirestoreDb() {
  return firestoreDb;
}

// ============================================================
// Auth Methods
// ============================================================

export async function signInWithGoogle(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not configured');
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not configured');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not configured');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ============================================================
// Sync Logic: Local ↔ Firestore
// ============================================================

export async function syncWithFirestore(userId: string): Promise<void> {
  const fs = getFirestoreDb();
  if (!fs) return;

  try {
    // 1. Fetch all cloud items for this user
    const cloudQuery = query(
      collection(fs, 'items'),
      where('user_id', '==', userId)
    );
    const cloudSnapshot = await getDocs(cloudQuery);
    const cloudItems: OmniItem[] = cloudSnapshot.docs.map(d => d.data() as OmniItem);

    // 2. Get all local items
    const localItems = await localDb.items.where('user_id').equals(userId).toArray();
    const localMap = new Map(localItems.map(i => [i.id, i]));
    const cloudMap = new Map(cloudItems.map(i => [i.id, i]));

    const toUpsertLocal: OmniItem[] = [];
    const toUpsertCloud: OmniItem[] = [];

    // 3. Merge: cloud newer → update local; local newer → update cloud
    const allIds = new Set([...localMap.keys(), ...cloudMap.keys()]);

    for (const id of allIds) {
      const local = localMap.get(id);
      const cloud = cloudMap.get(id);

      if (cloud && !local) {
        // Cloud only → add to local
        toUpsertLocal.push(cloud);
      } else if (local && !cloud) {
        // Local only → push to cloud
        toUpsertCloud.push(local);
      } else if (local && cloud) {
        // Both exist → compare updated_at
        if (cloud.updated_at > local.updated_at) {
          toUpsertLocal.push(cloud);
        } else if (local.updated_at > cloud.updated_at) {
          toUpsertCloud.push(local);
        }
      }
    }

    // Apply local updates
    if (toUpsertLocal.length > 0) {
      await upsertItems(toUpsertLocal);
    }

    // Apply cloud updates
    for (const item of toUpsertCloud) {
      const docRef = doc(fs, 'items', item.id);
      await setDoc(docRef, { ...item, synced: true });
    }

    console.log(`Sync complete: ↓${toUpsertLocal.length} from cloud, ↑${toUpsertCloud.length} to cloud`);
  } catch (e) {
    console.error('Sync failed:', e);
    throw e;
  }
}

export async function pushItemToCloud(item: OmniItem): Promise<void> {
  const fs = getFirestoreDb();
  if (!fs) return;
  const docRef = doc(fs, 'items', item.id);
  await setDoc(docRef, { ...item, synced: true });
}

export async function deleteItemFromCloud(itemId: string): Promise<void> {
  const fs = getFirestoreDb();
  if (!fs) return;
  const { deleteDoc } = await import('firebase/firestore');
  const docRef = doc(fs, 'items', itemId);
  await deleteDoc(docRef);
}
