import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  Auth 
} from 'firebase/auth';
import { Invoice, ShopSettings, MetalRatesSnapshot } from './types';

const FIREBASE_CONFIG_STORAGE_KEY = 'mani_alankar_firebase_config';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

// Read config dynamically from Vite environment variables (.env) or localStorage
export const getActiveFirebaseConfig = (): FirebaseClientConfig | null => {
  try {
    // 1. Vite Environment Variables (Primary secure source from .env)
    const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

    if (envApiKey && envProjectId) {
      return {
        apiKey: envApiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
        projectId: envProjectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      };
    }

    // 2. Local storage custom config fallback
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading dynamic Firebase config:', err);
  }
  return null;
};

export const saveCustomFirebaseConfig = (config: FirebaseClientConfig): void => {
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const isFirebaseConfigured = (): boolean => {
  const cfg = getActiveFirebaseConfig();
  return Boolean(cfg && cfg.apiKey && cfg.projectId);
};

// Initialize Firebase App Singleton
let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();

export const getFirebaseInstance = () => {
  const config = getActiveFirebaseConfig();
  if (!config) {
    return { app: null, db: null, auth: null };
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    return { app: firebaseApp, db: firestoreDb, auth: firebaseAuth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, db: null, auth: null };
  }
};

// Google Popup Authentication
export const signInWithGoogle = async (): Promise<{ success: boolean; email?: string; error?: string }> => {
  const { auth } = getFirebaseInstance();
  if (!auth) {
    return { 
      success: false, 
      error: 'Firebase is not yet configured. Please set your Firebase credentials in Shop Settings.' 
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user && user.email) {
      return { success: true, email: user.email.toLowerCase() };
    }
    return { success: false, error: 'Could not obtain email address from Google Account.' };
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    return { 
      success: false, 
      error: err.message || 'Google sign-in popup was closed or failed.' 
    };
  }
};

export const signOutGoogle = async (): Promise<void> => {
  const { auth } = getFirebaseInstance();
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
  }
};

// ==========================================
// FIRESTORE CLOUD DATA SYNC HELPERS
// ==========================================

// 1. Sync Single Invoice to Firestore
export const syncInvoiceToCloud = async (invoice: Invoice): Promise<boolean> => {
  const { db } = getFirebaseInstance();
  if (!db) return false;

  try {
    const invoiceRef = doc(db, 'invoices', invoice.id);
    await setDoc(invoiceRef, invoice, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to sync invoice to cloud:', err);
    return false;
  }
};

// 2. Batch Sync All Invoices to Firestore
export const syncAllInvoicesToCloud = async (invoices: Invoice[]): Promise<boolean> => {
  const { db } = getFirebaseInstance();
  if (!db) return false;

  try {
    const batch = writeBatch(db);
    invoices.forEach((inv) => {
      const ref = doc(db, 'invoices', inv.id);
      batch.set(ref, inv, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (err) {
    console.error('Failed to batch sync invoices to cloud:', err);
    return false;
  }
};

// 3. Fetch All Invoices from Firestore (Sorted descending by date)
export const fetchInvoicesFromCloud = async (): Promise<Invoice[] | null> => {
  const { db } = getFirebaseInstance();
  if (!db) return null;

  try {
    const colRef = collection(db, 'invoices');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    
    const invoices: Invoice[] = [];
    snapshot.forEach(docSnap => {
      invoices.push(docSnap.data() as Invoice);
    });
    // Sort chronological descending (latest first)
    invoices.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.invoiceDate).getTime() || 0;
      const timeB = new Date(b.createdAt || b.invoiceDate).getTime() || 0;
      return timeB - timeA;
    });
    return invoices;
  } catch (err) {
    console.error('Failed to fetch invoices from cloud:', err);
    return null;
  }
};

// 4. Real-time Invoices Subscription (Sorted descending by date)
export const subscribeToCloudInvoices = (
  onData: (invoices: Invoice[]) => void
): (() => void) | null => {
  const { db } = getFirebaseInstance();
  if (!db) return null;

  try {
    const colRef = collection(db, 'invoices');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const list: Invoice[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Invoice);
      });
      if (list.length > 0) {
        // Sort chronological descending (latest first)
        list.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.invoiceDate).getTime() || 0;
          const timeB = new Date(b.createdAt || b.invoiceDate).getTime() || 0;
          return timeB - timeA;
        });
        onData(list);
      }
    }, (err) => {
      console.warn('Real-time invoices snapshot error:', err);
    });
    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to cloud invoices:', err);
    return null;
  }
};

// 5. Sync Settings to Firestore
export const syncSettingsToCloud = async (settings: ShopSettings): Promise<boolean> => {
  const { db } = getFirebaseInstance();
  if (!db) return false;

  try {
    const ref = doc(db, 'settings', 'shop_profile');
    // Sanitize to clean any undefined fields that cause Firestore setDoc to fail
    const cleanSettings = JSON.parse(JSON.stringify(settings));
    await setDoc(ref, cleanSettings, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to sync settings to cloud:', err);
    return false;
  }
};

// 6. Fetch Settings from Firestore
export const fetchSettingsFromCloud = async (): Promise<ShopSettings | null> => {
  const { db } = getFirebaseInstance();
  if (!db) return null;

  try {
    const ref = doc(db, 'settings', 'shop_profile');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as ShopSettings;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch settings from cloud:', err);
    return null;
  }
};

// 6b. Real-time Shop Settings & Whitelist Subscription
export const subscribeToCloudSettings = (
  onData: (settings: ShopSettings) => void
): (() => void) | null => {
  const { db } = getFirebaseInstance();
  if (!db) return null;

  try {
    const ref = doc(db, 'settings', 'shop_profile');
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        onData(snap.data() as ShopSettings);
      }
    }, (err) => {
      console.warn('Real-time settings snapshot notice:', err);
    });
    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to cloud settings:', err);
    return null;
  }
};

// 7. Sync Rates to Firestore
export const syncRatesToCloud = async (rates: MetalRatesSnapshot): Promise<boolean> => {
  const { db } = getFirebaseInstance();
  if (!db) return false;

  try {
    const ref = doc(db, 'settings', 'metal_rates');
    await setDoc(ref, rates, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to sync rates to cloud:', err);
    return false;
  }
};
