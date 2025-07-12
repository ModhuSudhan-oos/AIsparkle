// admin-dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, 
    query, orderBy, doc, deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, signOut, onAuthStateChanged 
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
const db = getFirestore(app);
const auth = getAuth();

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'admin-login.html';
    } else {
        loadTools();
    }
});

// Load tools for admin
const loadTools = async () => {
    const q = query(collection(db, "tools"), orderBy("name"));
    const querySnapshot = await getDocs(q);
    const toolsTableBody = document.getElementById('toolsTableBody');
    
    toolsTableBody.innerHTML = '';
    
    querySnapshot.forEach(doc => {
        const tool = doc.data();
        tool.id = doc.id;
        renderToolRow(tool);
    });
};

const renderToolRow = (tool) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <div class="tool-info">
                <img src="assets/tool-icons/${tool.icon}" alt="${tool.name}">
                <div>
                    <div class="tool-name">${tool.name}</div>
                    <div class="tool-desc">${tool.shortDesc.substring(0, 50)}...</div>
                </div>
            </div>
        </td>
        <td>${tool.category}</td>
        <td>${tool.pricing}</td>
        <td>
            <div class="rating">
                ${renderStars(tool.rating)}
                <span>${tool.rating}</span>
            </div>
        </td>
        <td><span class="status active">Active</span></td>
        <td>
            <div class="actions">
                <button class="edit-btn"><i class="edit-icon"></i></button>
                <button class="delete-btn" data-id="${tool.id}"><i class="delete-icon"></i></button>
            </div>
        </td>
    `;
    
    document.getElementById('toolsTableBody').appendChild(row);
    
    // Add event listener for delete button
    const deleteBtn = row.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete ${tool.name}?`)) {
            deleteTool(tool.id);
        }
    });
};

const renderStars = (rating) => {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="star full"></i>';
        } else if (i === fullStars + 1 && halfStar) {
            stars += '<i class="star half"></i>';
        } else {
            stars += '<i class="star"></i>';
        }
    }
    return stars;
};

const deleteTool = async (toolId) => {
    try {
        await deleteDoc(doc(db, "tools", toolId));
        loadTools();
    } catch (error) {
        console.error("Error deleting tool: ", error);
        alert('Failed to delete tool: ' + error.message);
    }
};

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'admin-login.html';
    }).catch((error) => {
        console.error("Logout error: ", error);
    });
});

// Set up real-time listener for tools
const toolsRef = collection(db, "tools");
onSnapshot(toolsRef, (snapshot) => {
    loadTools();
});
