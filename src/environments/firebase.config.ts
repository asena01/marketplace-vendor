import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { environment } from './environment';

// Initialize Firebase with config from environment
export const firebaseConfig = environment.firebaseConfig;

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(firebaseApp);

// Initialize Cloud Storage
export const storage = getStorage(firebaseApp);

// Initialize Realtime Database (optional)
// export const database = getDatabase(firebaseApp);

export default firebaseApp;
