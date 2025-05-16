// src/firebase-config.ts
import { initializeApp } from 'firebase/app';
//import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyBCCWcyuiVefIo0nKGpIsFOOdXXWaHY8pg",
    authDomain: "task-management-tool-cfec1.firebaseapp.com",
    projectId: "task-management-tool-cfec1",
    storageBucket: "task-management-tool-cfec1.firebasestorage.app",
    messagingSenderId: "61179140373",
    appId: "1:61179140373:web:0728c5c4f17c28e5b1311c",
    measurementId: "G-FHMNGR7X7P"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export default app;
