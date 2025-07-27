import { 
  fetchTools, 
  fetchToolById, 
  fetchFeatures, 
  fetchFAQs, 
  fetchTestimonials, 
  fetchAboutContent,
  submitContactForm
} from './firebase.js';

// DOM elements
const elements = {
  toolsContainer: document.getElementById('tools-container'),
  toolDetails: document.getElementById('tool-details'),
  featuresContainer: document.getElementById('features-container'),
  faqContainer: document.getElementById('faq-container'),
  testimonialsContainer: document.getElementById('testimonials-container'),
  aboutContent: document.getElementById('about-content'),
  contactForm: document.getElementById('contact-form')
};

// Common UI functions
const renderLoader = (container) => {
  container.innerHTML = '<div class="text-center py-8"><div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>';
};

const renderError = (container) => {
  container.innerHTML = '<div class="text-center py-8 text-red-500">Failed to load content. Please try again later.</div>';
};

// Tool rendering functions
export const renderTools = async (limit = null) => {
  if (!elements.toolsContainer) return;
  
  renderLoader(elements.toolsContainer);
  const tools = await fetchTools();
  
  if (!tools) {
    renderError(elements.toolsContainer);
    return;
  }
  
  let toolsArray = Object.entries(tools).map(([id, tool]) => ({ id, ...tool }));
  
  if (limit) {
    toolsArray = toolsArray.slice(0, limit);
  }
  
  elements.toolsContainer.innerHTML = toolsArray.map(tool => `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div class="p-6">
        <div class="flex items-center mb-4">
          ${tool.icon ? `<span class="text-2xl mr-3">${tool.icon}</span>` : ''}
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white">${tool.title}</h3>
        </div>
        <p class="text-gray-600 dark:text-gray-300 mb-4">${tool.description}</p>
        <a href="tool.html?id=${tool.id}" class="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          Explore Tool
        </a>
      </div>
    </div>
  `).join('');
};

export const renderToolDetails = async () => {
  if (!elements.toolDetails) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const toolId = urlParams.get('id');
  
  if (!toolId) {
    elements.toolDetails.innerHTML = '<div class="text-center py-8 text-red-500">Tool ID not specified.</div>';
    return;
  }
  
  renderLoader(elements.toolDetails);
  const tool = await fetchToolById(toolId);
  
  if (!tool) {
    renderError(elements.toolDetails);
    return;
  }
  
  elements.toolDetails.innerHTML = `
    <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="md:flex">
        <div class="md:w-1/2 p-6">
          <div class="flex items-center mb-6">
            <a href="tools.html" class="mr-4 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white">${tool.title}</h1>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-6">${tool.longDescription || tool.description}</p>
          
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-3">Features</h2>
            <ul class="space-y-2">
              ${tool.features ? tool.features.map(feature => `
                <li class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-600 dark:text-gray-300">${feature}</span>
                </li>
              `).join('') : ''}
            </ul>
          </div>
          
          <a href="${tool.url}" target="_blank" class="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium">
            Launch Tool
          </a>
        </div>
        <div class="md:w-1/2 bg-gray-100 dark:bg-gray-700 p-6 flex items-center justify-center">
          ${tool.image ? `
            <img src="${tool.image}" alt="${tool.title}" class="max-h-96 rounded-lg shadow-md">
          ` : `
            <div class="text-gray-400 dark:text-gray-500 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="mt-2">No preview available</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
};

// Other page rendering functions
export const renderFeatures = async () => {
  if (!elements.featuresContainer) return;
  
  renderLoader(elements.featuresContainer);
  const features = await fetchFeatures();
  
  if (!features) {
    renderError(elements.featuresContainer);
    return;
  }
  
  const featuresArray = Object.values(features);
  
  elements.featuresContainer.innerHTML = `
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${featuresArray.map(feature => `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-transform hover:scale-105">
          <div class="text-4xl mb-4">${feature.icon || '✨'}</div>
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">${feature.title}</h3>
          <p class="text-gray-600 dark:text-gray-300">${feature.description}</p>
        </div>
      `).join('')}
    </div>
  `;
};

export const renderFAQs = async () => {
  if (!elements.faqContainer) return;
  
  renderLoader(elements.faqContainer);
  const faqs = await fetchFAQs();
  
  if (!faqs) {
    renderError(elements.faqContainer);
    return;
  }
  
  const faqsArray = Object.values(faqs);
  
  elements.faqContainer.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-4">
      ${faqsArray.map((faq, index) => `
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button class="faq-toggle w-full flex justify-between items-center p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <h3 class="font-medium text-gray-800 dark:text-white">${faq.question}</h3>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 transform transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <div class="faq-content hidden px-4 pb-4 pt-2 text-gray-600 dark:text-gray-300">
            ${faq.answer}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  // Add event listeners for FAQ toggles
  document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      const icon = button.querySelector('svg');
      
      content.classList.toggle('hidden');
      icon.classList.toggle('rotate-180');
    });
  });
};

export const renderTestimonials = async () => {
  if (!elements.testimonialsContainer) return;
  
  renderLoader(elements.testimonialsContainer);
  const testimonials = await fetchTestimonials();
  
  if (!testimonials) {
    renderError(elements.testimonialsContainer);
    return;
  }
  
  const testimonialsArray = Object.values(testimonials);
  
  elements.testimonialsContainer.innerHTML = `
    <div class="testimonial-slider">
      <div class="flex overflow-x-auto snap-x snap-mandatory gap-4 py-4 px-2 -mx-2">
        ${testimonialsArray.map(testimonial => `
          <div class="snap-start shrink-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-semibold text-gray-600 dark:text-gray-300">
                ${testimonial.name.charAt(0)}
              </div>
              <div class="ml-4">
                <h4 class="font-semibold text-gray-800 dark:text-white">${testimonial.name}</h4>
                ${testimonial.role ? `<p class="text-sm text-gray-500 dark:text-gray-400">${testimonial.role}</p>` : ''}
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 italic">"${testimonial.quote}"</p>
            ${testimonial.rating ? `
              <div class="mt-4 flex items-center">
                ${Array.from({ length: 5 }).map((_, i) => `
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

export const renderAboutContent = async () => {
  if (!elements.aboutContent) return;
  
  renderLoader(elements.aboutContent);
  const about = await fetchAboutContent();
  
  if (!about) {
    renderError(elements.aboutContent);
    return;
  }
  
  elements.aboutContent.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Our Mission</h2>
        <p class="text-gray-600 dark:text-gray-300">${about.mission}</p>
      </section>
      
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Our Story</h2>
        <p class="text-gray-600 dark:text-gray-300">${about.story}</p>
      </section>
      
      ${about.team ? `
        <section>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Meet the Team</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${about.team.map(member => `
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                ${member.image ? `
                  <img src="${member.image}" alt="${member.name}" class="w-full h-48 object-cover">
                ` : `
                  <div class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                `}
                <div class="p-4">
                  <h3 class="font-semibold text-lg text-gray-800 dark:text-white">${member.name}</h3>
                  <p class="text-gray-500 dark:text-gray-400">${member.role}</p>
                  ${member.bio ? `<p class="mt-2 text-gray-600 dark:text-gray-300">${member.bio}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}
    </div>
  `;
};

// Contact form handling
export const setupContactForm = () => {
  if (!elements.contactForm) return;
  
  elements.contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: elements.contactForm.querySelector('[name="name"]').value,
      email: elements.contactForm.querySelector('[name="email"]').value,
      message: elements.contactForm.querySelector('[name="message"]').value,
      timestamp: new Date().toISOString()
    };
    
    const submitButton = elements.contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Sending...
    `;
    
    const success = await submitContactForm(formData);
    
    if (success) {
      elements.contactForm.innerHTML = `
        <div class="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">Message Sent Successfully!</h3>
          <p class="text-gray-600 dark:text-gray-300">Thank you for contacting us. We'll get back to you soon.</p>
        </div>
      `;
    } else {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      
      const errorElement = document.createElement('div');
      errorElement.className = 'text-red-500 text-sm mt-2';
      errorElement.textContent = 'Failed to send message. Please try again.';
      elements.contactForm.appendChild(errorElement);
    }
  });
};

// Search functionality for tools page
export const setupSearch = () => {
  const searchInput = document.getElementById('tools-search');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value.toLowerCase();
    const tools = await fetchTools();
    
    if (!tools) return;
    
    const toolsArray = Object.entries(tools).map(([id, tool]) => ({ id, ...tool }));
    const filteredTools = toolsArray.filter(tool => 
      tool.title.toLowerCase().includes(searchTerm) || 
      tool.description.toLowerCase().includes(searchTerm) ||
      (tool.categories && tool.categories.some(cat => cat.toLowerCase().includes(searchTerm)))
    );
    
    elements.toolsContainer.innerHTML = filteredTools.map(tool => `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div class="p-6">
          <div class="flex items-center mb-4">
            ${tool.icon ? `<span class="text-2xl mr-3">${tool.icon}</span>` : ''}
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">${tool.title}</h3>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-4">${tool.description}</p>
          <a href="tool.html?id=${tool.id}" class="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Explore Tool
          </a>
        </div>
      </div>
    `).join('');
  });
};

// Dark mode toggle
export const setupDarkMode = () => {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (!darkModeToggle) return;
  
  // Check for saved user preference or use system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedMode = localStorage.getItem('darkMode');
  
  if (savedMode === 'dark' || (!savedMode && prefersDark)) {
    document.documentElement.classList.add('dark');
    darkModeToggle.checked = true;
  }
  
  darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'light');
    }
  });
};

// Initialize page-specific functions
document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  
  // Determine which page we're on and load appropriate content
  const path = window.location.pathname.split('/').pop();
  
  switch (path) {
    case 'index.html':
    case '':
      renderTools(6);
      renderTestimonials();
      break;
    case 'tools.html':
      renderTools();
      setupSearch();
      break;
    case 'tool.html':
      renderToolDetails();
      break;
    case 'features.html':
      renderFeatures();
      break;
    case 'faq.html':
      renderFAQs();
      break;
    case 'about.html':
      renderAboutContent();
      break;
    case 'contact.html':
      setupContactForm();
      break;
  }
});
