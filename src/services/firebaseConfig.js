import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlqoifnDP7J2dsnjN7vQ6RpnCkG3Gag68",
    authDomain: "arsii-synergy-e0498.firebaseapp.com",
    projectId: "arsii-synergy-e0498",
    storageBucket: "arsii-synergy-e0498.firebasestorage.app",
    messagingSenderId: "722276450977",
    appId: "1:722276450977:web:77246469c6160bb00ea6e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
