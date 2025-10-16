// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAB7ZKmSHCFUSVBH-e8Q0FwF0Z0CKrU51A",
  authDomain: "turntaker-6af57.firebaseapp.com",
  databaseURL: "https://turntaker-6af57-default-rtdb.firebaseio.com",
  projectId: "turntaker-6af57",
  storageBucket: "turntaker-6af57.firebasestorage.app",
  messagingSenderId: "1039097049682",
  appId: "1:1039097049682:web:8eb41e7f171a6e9ab7a58b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); 

export default db; 