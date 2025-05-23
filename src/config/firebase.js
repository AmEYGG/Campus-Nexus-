import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD0yCMkXuobsQMos8StBpScxRMyVvrs1GY",
  authDomain: "campus-nexus-7cc6d.firebaseapp.com",
  databaseURL: "https://campus-nexus-7cc6d-default-rtdb.firebaseio.com",
  projectId: "campus-nexus-7cc6d",
  storageBucket: "campus-nexus-7cc6d.firebasestorage.app",
  messagingSenderId: "294521872172",
  appId: "1:294521872172:web:33e77d391c2d6967d15689",
  measurementId: "G-2JMEPCBNKT"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app, database, auth, analytics, storage }; 