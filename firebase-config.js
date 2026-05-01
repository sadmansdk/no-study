/* firebase-config.js — Firebase initialization (Compat Mode) */
const firebaseConfig = {
  apiKey: "AIzaSyBWvS7ykA6z6FPOTLtFRFKhDGjhLpCBgqs",
  authDomain: "no-study-4125f.firebaseapp.com",
  projectId: "no-study-4125f",
  storageBucket: "no-study-4125f.firebasestorage.app",
  messagingSenderId: "514481408191",
  appId: "1:514481408191:web:a45891cc6b758099bc9e0a",
  measurementId: "G-BFC9VSKGZJ"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
window.firebaseAuth = auth;
