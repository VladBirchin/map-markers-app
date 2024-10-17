import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyCaLhUjeLvyrkSciG8gQhc8JEvxafer2gQ",
    authDomain: "maps-811a8.firebaseapp.com",
    projectId: "maps-811a8",
    storageBucket: "maps-811a8.appspot.com",
    messagingSenderId: "560927020968",
    appId: "1:560927020968:web:e5cb92da398e1eee0d6f9d",
    measurementId: "G-LZF9YFKWEE"
};

const app = initializeApp(firebaseConfig);


const db = getFirestore(app);

export { db };





