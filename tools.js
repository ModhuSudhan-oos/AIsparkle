// tools.js

const toolsContainer = document.getElementById('tools-container');
const categoriesContainer = document.getElementById('categories-container');
const noToolsMessage = document.getElementById('no-tools-message');
const loadingToolsMessage = document.getElementById('loading-tools-message');

let allTools = []; // This will store tools fetched from Firebase
let currentActiveCategory = 'All'; // Default category

// Function to render tool cards
function renderTools(toolsToDisplay) {
    toolsContainer.innerHTML = ''; // Clear previous tools
    loadingToolsMessage.classList.add('hidden'); // Hide loading message

    if (toolsToDisplay.length === 0) {
        noToolsMessage.classList.remove('hidden');
        return;
    } else {
        noToolsMessage.classList.add('hidden');
    }

    // Display max 12 tools, or fewer if filtered results are less
    toolsToDisplay.slice(0, 12).forEach(tool => {
        const toolCard = `
            <div class="tool-card bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-103">
                <img src="${tool.image}" alt="${tool.title}" class="w-28 h-28 object-contain mb-4 rounded-xl shadow-md">
                <h3 class="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">${tool.title}</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3">${tool.description}</p>
                <span class="inline-block bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    ${tool.category}
                </span>
                <a href="${tool.link}" target="_blank" rel="noopener noreferrer"
                   class="mt-auto bg-blue-600 text-white px-7 py-3 rounded-full font-bold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center">
                    Visit Tool
                    <i class="fas fa-external-link-alt ml-2 text-sm"></i>
                </a>
            </div>
        `;
        toolsContainer.innerHTML += toolCard;
    });
}

// Function to render category buttons
function renderCategories() {
    const categories = ['All', ...new Set(allTools.map(tool => tool.category))];
    categoriesContainer.innerHTML = ''; // Clear previous categories

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.classList.add('category-btn', 'px-6', 'py-3', 'rounded-full', 'border', 'border-gray-300', 'dark:border-gray-700',
                             'text-gray-700', 'dark:text-gray-300', 'hover:bg-blue-100', 'dark:hover:bg-gray-700',
                             'font-medium', 'text-base', 'whitespace-nowrap', 'transition-all', 'duration-300', 'focus:outline-none');
        if (category === currentActiveCategory) {
            button.classList.add('active'); // Apply active class
        }
        button.addEventListener('click', () => {
            filterTools(category);
            // Update active state
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
        categoriesContainer.appendChild(button);
    });
}

// Function to filter tools by category
function filterTools(category) {
    currentActiveCategory = category;
    let filtered = [];
    if (category === 'All') {
        filtered = allTools;
    } else {
        filtered = allTools.filter(tool => tool.category === category);
    }
    renderTools(filtered);
}

// Function to fetch tools from Firebase
async function fetchToolsFromFirebase() {
    loadingToolsMessage.classList.remove('hidden'); // Show loading message
    try {
        const toolsRef = db.collection('ai_tools'); // Reference to your 'ai_tools' collection
        // Order by timestamp to get newest first, then limit
        const snapshot = await toolsRef.orderBy('timestamp', 'desc').get();
        const fetchedTools = [];
        snapshot.forEach(doc => {
            fetchedTools.push({ id: doc.id, ...doc.data() });
        });
        allTools = fetchedTools; // Update global tools array

        renderCategories();
        filterTools(currentActiveCategory); // Display initial tools
    } catch (error) {
        console.error("Error fetching tools from Firebase: ", error);
        loadingToolsMessage.textContent = 'Failed to load tools. Please try again later.';
        loadingToolsMessage.style.color = 'red';
        noToolsMessage.classList.remove('hidden'); // Show no tools message if loading fails entirely
    }
}

// Initial load: Fetch tools from Firebase
document.addEventListener('DOMContentLoaded', fetchToolsFromFirebase);
