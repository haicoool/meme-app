import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA7bCiuxa5p-Jo2ECoy2sl7144OP8Z-C2g",
    authDomain: "memeapp-efe5a.firebaseapp.com",
    projectId: "memeapp-efe5a",
    storageBucket: "memeapp-efe5a.firebasestorage.app",
    messagingSenderId: "79751913607",
    appId: "1:79751913607:web:c51dc93dc51def91275822",
    measurementId: "G-FH8F0L8483"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);