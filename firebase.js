import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut,
    GoogleAuthProvider,signInWithPopup} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
  const firebaseConfig = {
    apiKey: "AIzaSyB9_nqZXGwTCZ1edUMF3kHxFb5Tisakovo",
    authDomain: "practice-d29e9.firebaseapp.com",
    projectId: "practice-d29e9",
    storageBucket: "practice-d29e9.firebasestorage.app",
    messagingSenderId: "1086461013407",
    appId: "1:1086461013407:web:5f1009519e907d009aa1aa",
    measurementId: "G-T5FBEH9HZY"
  };
  const app = initializeApp(firebaseConfig);
  const auth= getAuth(app);
  const provider = new GoogleAuthProvider();
  export{
  auth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut,
    GoogleAuthProvider,signInWithPopup,provider
  }