// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, 
    query, orderBy, limit, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// DOM Elements
const categoriesContainer = document.getElementById('categoriesContainer');
const featuredTools = document.getElementById('featuredTools');
const footerCategories = document.getElementById('footerCategories');
const viewAllTools = document.getElementById('viewAllTools');
const globalSearch = document.getElementById('globalSearch');

// Load categories from Firebase
const loadCategories = async () => {
    const q = query(collection(db, "categories"), orderBy("name"));
    const querySnapshot = await getDocs(q);
    
    categoriesContainer.innerHTML = '';
    footerCategories.innerHTML = '';
    
    querySnapshot.forEach(doc => {
        const category = doc.data();
        renderCategory(category, categoriesContainer);
        
        // Also add to footer categories
        renderFooterCategory(category);
    });
};

const renderCategory = (category, container) => {
    const categoryCard = document.createElement('div');
    categoryCard.className = 'category-card';
    categoryCard.innerHTML = `
        <div class="category-icon">
            <img src="assets/category-icons/${category.icon}" alt="${category.name}">
        </div>
        <h3>${category.name}</h3>
        <div class="count">${category.toolCount}+ Tools</div>
    `;
    categoryCard.addEventListener('click', () => {
        window.location.href = `category.html?id=${category.id}`;
    });
    container.appendChild(categoryCard);
};

const renderFooterCategory = (category) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="category.html?id=${category.id}">${category.name}</a>`;
    footerCategories.appendChild(li);
};

// Load featured tools
const loadFeaturedTools = async () => {
    const q = query(collection(db, "tools"), orderBy("rating", "desc"), limit(6));
    const querySnapshot = await getDocs(q);
    
    featuredTools.innerHTML = '';
    
    querySnapshot.forEach(doc => {
        const tool = doc.data();
        tool.id = doc.id;
        renderTool(tool);
    });
};

const renderTool = (tool) => {
    const toolCard = document.createElement('div');
    toolCard.className = 'tool-card';
    toolCard.innerHTML = `
        <div class="tool-image">
            <img src="assets/tool-icons/${tool.icon}" alt="${tool.name}">
        </div>
        <div class="tool-content">
            <div class="tool-badge">Featured</div>
            <h3>${tool.name}</h3>
            <p class="tool-description">${tool.shortDesc}</p>
            <div class="tool-meta">
                <div class="tool-price">${tool.pricing}</div>
                <a href="tool-details.html?id=${tool.id}" class="view-details">View Details</a>
            </div>
        </div>
    `;
    featuredTools.appendChild(toolCard);
};

// Mobile menu toggle
document.querySelector('.mobile-menu').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('show');
});

// View All Tools button
viewAllTools.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'all-tools.html';
});

// Global search functionality
globalSearch.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        const searchTerm = this.value.trim();
        if (searchTerm) {
            window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
        }
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadFeaturedTools();
    
    // Set up real-time listeners
    const toolsRef = collection(db, "tools");
    onSnapshot(toolsRef, (snapshot) => {
        loadFeaturedTools();
    });
    
    const categoriesRef = collection(db, "categories");
    onSnapshot(categoriesRef, (snapshot) => {
        loadCategories();
    });
});
