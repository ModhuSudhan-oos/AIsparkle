// admin-dashboard.js (complete solution)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, 
    query, orderBy, doc, deleteDoc,
    onSnapshot, addDoc, updateDoc, where
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

// DOM Elements
const toolsTableBody = document.getElementById('toolsTableBody');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const adminSearchInput = document.getElementById('adminSearchInput');
const searchBtn = document.getElementById('searchBtn');
const addToolBtn = document.getElementById('addToolBtn');
const logoutBtn = document.getElementById('logoutBtn');
const toolModal = document.getElementById('toolModal');
const closeModal = document.getElementById('closeModal');
const toolForm = document.getElementById('toolForm');
const modalTitle = document.getElementById('modalTitle');
const toolIdInput = document.getElementById('toolId');
const pagination = document.getElementById('pagination');
const totalToolsEl = document.getElementById('totalTools');
const totalCategoriesEl = document.getElementById('totalCategories');

// Global Variables
let unsubscribeTools = null;
let unsubscribeCategories = null;
let allTools = [];
let filteredTools = [];
let categories = [];
let currentPage = 1;
const TOOLS_PER_PAGE = 10;
let currentCategory = 'all';
let currentSort = 'newest';
let currentSearch = '';

// Initialize Admin Dashboard
const initAdminDashboard = async () => {
    // Load categories
    await loadCategories();
    
    // Set up category filter options
    populateCategoryFilter();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load tools
    loadTools();
    
    // Update stats
    updateStats();
};

// Load categories from Firebase
const loadCategories = async () => {
    const q = query(collection(db, "categories"), orderBy("name"));
    const querySnapshot = await getDocs(q);
    
    categories = [];
    querySnapshot.forEach(doc => {
        const category = { id: doc.id, ...doc.data() };
        categories.push(category);
    });
    
    // Set up real-time listener for categories
    if (unsubscribeCategories) unsubscribeCategories();
    unsubscribeCategories = onSnapshot(q, (snapshot) => {
        categories = [];
        snapshot.forEach(doc => {
            const category = { id: doc.id, ...doc.data() };
            categories.push(category);
        });
        populateCategoryFilter();
        populateCategoryModal();
        updateStats();
    });
};

// Populate category filter dropdown
const populateCategoryFilter = () => {
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
};

// Populate category options in modal
const populateCategoryModal = () => {
    const toolCategory = document.getElementById('toolCategory');
    toolCategory.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        toolCategory.appendChild(option);
    });
};

// Load tools from Firebase
const loadTools = () => {
    let q;
    
    // Apply category filter
    if (currentCategory !== 'all') {
        q = query(collection(db, "tools"), where("category", "==", currentCategory));
    } else {
        q = query(collection(db, "tools"));
    }
    
    // Remove previous listener if exists
    if (unsubscribeTools) unsubscribeTools();
    
    // Set up real-time listener for tools
    unsubscribeTools = onSnapshot(q, (snapshot) => {
        allTools = [];
        snapshot.forEach(doc => {
            const tool = { id: doc.id, ...doc.data() };
            allTools.push(tool);
        });
        
        // Apply search and sort
        filterAndSortTools();
        
        // Update stats
        updateStats();
        
        // Render tools
        renderToolsTable();
    });
};

// Filter and sort tools based on current criteria
const filterAndSortTools = () => {
    // Apply search filter
    if (currentSearch) {
        filteredTools = allTools.filter(tool => 
            tool.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
            (tool.shortDesc && tool.shortDesc.toLowerCase().includes(currentSearch.toLowerCase()))
    } else {
        filteredTools = [...allTools];
    }
    
    // Apply sorting
    switch(currentSort) {
        case 'name-asc':
            filteredTools.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredTools.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'rating-desc':
            filteredTools.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'rating-asc':
            filteredTools.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            break;
        case 'newest':
        default:
            filteredTools.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
            break;
    }
    
    // Reset to first page
    currentPage = 1;
};

// Render tools table
const renderToolsTable = () => {
    if (filteredTools.length === 0) {
        toolsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-results">
                    No tools found. Try changing your filters or add a new tool.
                </td>
            </tr>
        `;
        pagination.innerHTML = '';
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredTools.length / TOOLS_PER_PAGE);
    const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
    const endIndex = Math.min(startIndex + TOOLS_PER_PAGE, filteredTools.length);
    const currentTools = filteredTools.slice(startIndex, endIndex);
    
    // Render tools
    toolsTableBody.innerHTML = '';
    currentTools.forEach(tool => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="tool-info">
                    <img src="assets/tool-icons/${tool.icon || 'default.png'}" alt="${tool.name}">
                    <div>
                        <div class="tool-name">${tool.name}</div>
                        <div class="tool-desc">${tool.shortDesc?.substring(0, 60) || ''}${tool.shortDesc?.length > 60 ? '...' : ''}</div>
                    </div>
                </div>
            </td>
            <td>${getCategoryName(tool.category)}</td>
            <td>${tool.pricing || 'Free'}</td>
            <td>
                <div class="rating">
                    ${renderStars(tool.rating || 4.5)}
                    <span>${tool.rating || 4.5}</span>
                </div>
            </td>
            <td><span class="status ${tool.status || 'active'}">${tool.status || 'active'}</span></td>
            <td>
                <div class="actions">
                    <button class="edit-btn" data-id="${tool.id}"><i class="edit-icon"></i></button>
                    <button class="delete-btn" data-id="${tool.id}"><i class="delete-icon"></i></button>
                </div>
            </td>
        `;
        toolsTableBody.appendChild(row);
    });
    
    // Render pagination
    renderPagination(totalPages);
};

// Get category name by ID
const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
};

// Render star rating
const renderStars = (rating) => {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="star full">★</i>';
        } else if (i === fullStars + 1 && halfStar) {
            stars += '<i class="star half">★</i>';
        } else {
            stars += '<i class="star">☆</i>';
        }
    }
    return stars;
};

// Render pagination controls
const renderPagination = (totalPages) => {
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    pagination.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&laquo;';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderToolsTable();
        }
    });
    pagination.appendChild(prevBtn);
    
    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.toggle('active', i === currentPage);
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderToolsTable();
        });
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&raquo;';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderToolsTable();
        }
    });
    pagination.appendChild(nextBtn);
};

// Update dashboard stats
const updateStats = () => {
    totalToolsEl.textContent = allTools.length;
    totalCategoriesEl.textContent = categories.length;
};

// Setup event listeners
const setupEventListeners = () => {
    // Category filter
    categoryFilter.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        loadTools();
    });
    
    // Sort filter
    sortFilter.addEventListener('change', (e) => {
        currentSort = e.target.value;
        filterAndSortTools();
        renderToolsTable();
    });
    
    // Search functionality
    searchBtn.addEventListener('click', () => {
        currentSearch = adminSearchInput.value.trim();
        filterAndSortTools();
        renderToolsTable();
    });
    
    adminSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            currentSearch = adminSearchInput.value.trim();
            filterAndSortTools();
            renderToolsTable();
        }
    });
    
    // Add tool button
    addToolBtn.addEventListener('click', () => {
        openToolModal();
    });
    
    // Close modal
    closeModal.addEventListener('click', () => {
        toolModal.classList.remove('show');
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === toolModal) {
            toolModal.classList.remove('show');
        }
    });
    
    // Form submission
    toolForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveTool();
    });
    
    // Logout button
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'admin-login.html';
        }).catch((error) => {
            console.error("Logout error: ", error);
        });
    });
    
    // Edit/Delete buttons (delegated)
    toolsTableBody.addEventListener('click', (e) => {
        const toolId = e.target.closest('button')?.dataset.id;
        if (!toolId) return;
        
        if (e.target.closest('.edit-btn')) {
            editTool(toolId);
        } else if (e.target.closest('.delete-btn')) {
            deleteTool(toolId);
        }
    });
};

// Open modal for adding/editing tool
const openToolModal = (tool = null) => {
    if (tool) {
        // Editing existing tool
        modalTitle.textContent = 'Edit Tool';
        toolIdInput.value = tool.id;
        document.getElementById('toolName').value = tool.name || '';
        document.getElementById('toolCategory').value = tool.category || '';
        document.getElementById('toolPricing').value = tool.pricing || 'Free';
        document.getElementById('shortDesc').value = tool.shortDesc || '';
        document.getElementById('longDesc').value = tool.longDesc || '';
        document.getElementById('toolWebsite').value = tool.website || '';
        document.getElementById('toolRating').value = tool.rating || 4.5;
        document.getElementById('toolStatus').value = tool.status || 'active';
        document.getElementById('toolFeatures').value = tool.features?.join(', ') || '';
        document.getElementById('toolIcon').value = tool.icon || '';
    } else {
        // Adding new tool
        modalTitle.textContent = 'Add New Tool';
        toolForm.reset();
        toolIdInput.value = '';
    }
    
    toolModal.classList.add('show');
};

// Save tool to Firebase
const saveTool = async () => {
    const toolId = toolIdInput.value;
    const toolData = {
        name: document.getElementById('toolName').value,
        category: document.getElementById('toolCategory').value,
        pricing: document.getElementById('toolPricing').value,
        shortDesc: document.getElementById('shortDesc').value,
        longDesc: document.getElementById('longDesc').value,
        website: document.getElementById('toolWebsite').value,
        rating: parseFloat(document.getElementById('toolRating').value) || 4.5,
        status: document.getElementById('toolStatus').value,
        features: document.getElementById('toolFeatures').value
            .split(',')
            .map(f => f.trim())
            .filter(f => f),
        icon: document.getElementById('toolIcon').value || 'default.png',
        createdAt: new Date()
    };
    
    try {
        if (toolId) {
            // Update existing tool
            await updateDoc(doc(db, "tools", toolId), toolData);
        } else {
            // Add new tool
            await addDoc(collection(db, "tools"), toolData);
        }
        
        toolModal.classList.remove('show');
        alert('Tool saved successfully!');
    } catch (error) {
        console.error("Error saving tool: ", error);
        alert('Failed to save tool: ' + error.message);
    }
};

// Edit existing tool
const editTool = async (toolId) => {
    const toolRef = doc(db, "tools", toolId);
    const toolSnap = await getDoc(toolRef);
    
    if (toolSnap.exists()) {
        openToolModal({ id: toolId, ...toolSnap.data() });
    } else {
        alert('Tool not found!');
    }
};

// Delete tool
const deleteTool = async (toolId) => {
    if (confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
        try {
            await deleteDoc(doc(db, "tools", toolId));
            alert('Tool deleted successfully!');
        } catch (error) {
            console.error("Error deleting tool: ", error);
            alert('Failed to delete tool: ' + error.message);
        }
    }
};

// Initialize the dashboard when auth state is confirmed
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'admin-login.html';
    } else {
        initAdminDashboard();
        populateCategoryModal();
    }
});
