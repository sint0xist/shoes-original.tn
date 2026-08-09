import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(config) : getApp();

// Initialize Firestore with specific database ID from config if present
export const db = getFirestore(app, config.firestoreDatabaseId || undefined);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;
