
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBuDFJiRaXBt3VgK38CrlHRsbYFPLHqbE4',
  authDomain: 'campus-notice-hub.firebaseapp.com',
  projectId: 'campus-notice-hub',
  storageBucket: 'campus-notice-hub.appspot.com',
  messagingSenderId: '351845562254',
  appId: '1:351845562254:web:b910d1239f9ce74c69d6df',
  measurementId: 'G-3Y9XT6HPQN',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
