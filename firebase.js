// firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyD_rjgegrGF5cjcW0JQgip0rLGntDl9k9Q",
  authDomain: "safari-cis.firebaseapp.com",
  projectId: "safari-cis",
  storageBucket: "safari-cis.firebasestorage.app",
  messagingSenderId: "926885582043",
  appId: "1:926885582043:web:b197acf3c55389f876e8fe"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Make Firestore accessible globally
window.db = db;
