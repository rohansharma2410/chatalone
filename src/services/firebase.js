import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyCJblsmeQEh72nZBlyAsxGy3Jzq3YGQKFQ",
  authDomain: "chatalone-c9d8e.firebaseapp.com",
  projectId: "chatalone-c9d8e",
  databaseURL: "https://chatalone-c9d8e-default-rtdb.firebaseio.com/",
  storageBucket: "chatalone-c9d8e.appspot.com",
  messagingSenderId: "320320398044",
  appId: "1:320320398044:web:e365a21ddd87f5b3724a19"

  
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth;
export const db = firebase.database();
export const firestore = firebase.firestore();
