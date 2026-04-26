import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const firebaseConfig = {
    apiKey: "AIzaSyCjCvkQJuC3N1flSB_4M0-_GP7ltVTH0Ko",
    authDomain: "bichcoffee-c0ef8.firebaseapp.com",
    projectId: "bichcoffee-c0ef8",
    storageBucket: "bichcoffee-c0ef8.firebasestorage.app",
    messagingSenderId: "1096220661361",
    appId: "1:1096220661361:web:d36215b271d48f6a66add0",
    measurementId: "G-GDMMHWJV24"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
