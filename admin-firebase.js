// admin-firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCsLbHXc-vX9pkF7pwwZIqIpoj8yzL-jKU",
    authDomain: "ai-tools-403b4.firebaseapp.com",
    projectId: "ai-tools-403b4",
    storageBucket: "ai-tools-403b4.appspot.com",
    messagingSenderId: "1015577811129",
    appId: "1:1015577811129:web:6f6fc021d0b7a866ed2368",
    measurementId: "G-B3K1X9PGKE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Redirect to admin dashboard
        window.location.href = 'admin.html';
    } catch (error) {
        loginMessage.textContent = error.message;
        loginMessage.className = 'login-message error';
    }
});
