import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDaIZSEBHq5AnhzpnkaFQwChzx6Cc1csU4",
    authDomain: "qabulgo.firebaseapp.com",
    projectId: "qabulgo",
    storageBucket: "qabulgo.firebasestorage.app",
    messagingSenderId: "834306480680",
    appId: "1:834306480680:web:e627d99dcda2f4b6b1b31d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);

export { auth };
