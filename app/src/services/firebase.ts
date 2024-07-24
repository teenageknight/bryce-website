import { initializeApp } from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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

// eslint-disable-next-line no-restricted-globals
if (location.hostname === "localhost") {
    // db.useEmulator("localhost", 8080);
    // auth().useEmulator("http://localhost:9099/", { disableWarnings: true });
}

export { app };
