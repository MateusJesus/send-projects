import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBaMZtAJe4TweCiHdNO3EY0xQaVe0DpBgA",
  authDomain: "portfolio-api-2cd53.firebaseapp.com",
  projectId: "portfolio-api-2cd53",
  storageBucket: "portfolio-api-2cd53.appspot.com",
  messagingSenderId: "610006847390",
  appId: "1:610006847390:web:a5c932a4482f0a7360508f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };