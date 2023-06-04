// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars

// const analytics = getAnalytics(app);

export { app };
