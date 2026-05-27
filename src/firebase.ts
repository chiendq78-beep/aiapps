import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const hasValidConfig = !!(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.trim().length > 0 &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.trim().length > 0
);

let app: any;
let auth: any = null;

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error('Failed to initialize Firebase SDK:', error);
  }
}

export function getFirestoreDB(customDbId?: string) {
  if (!hasValidConfig || !app) return null;
  const dbId = customDbId || localStorage.getItem('nexus_selected_db_id') || (firebaseConfig as any).firestoreDatabaseId || '(default)';
  try {
    // Always attempt to initialize with ignoreUndefinedProperties first
    return initializeFirestore(app, {
      ignoreUndefinedProperties: true
    }, dbId);
  } catch (err) {
    try {
      // If already initialized, retrieve the existing active instance
      return getFirestore(app, dbId);
    } catch (e) {
      console.error('getFirestoreDB retrieval failed:', e);
      try {
        return getFirestore(app);
      } catch (lastErr) {
        return null;
      }
    }
  }
}

export { auth };
export const isFirebaseEnabled = hasValidConfig;

