import { initializeApp } from "firebase/app";

// TODO: Use a configuration object
const firebaseConfig = {
    apiKey: "AIzaSyALZ4VKchAJlpgPBOfahbLLIzYYsiIfMoY",
    authDomain: "bryce-jackson-website.firebaseapp.com",
    databaseURL: "https://bryce-jackson-website-default-rtdb.firebaseio.com",
    projectId: "bryce-jackson-website",
    storageBucket: "bryce-jackson-website.appspot.com",
    messagingSenderId: "401096318099",
    appId: "1:401096318099:web:8bc656fe7b37675e9a4166",
    measurementId: "G-C85YG132CP",
};

const app = initializeApp(firebaseConfig);

export { app };
