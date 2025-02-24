// Store the current page in localStorage and URL hash
function navigateTo(page) {
    // Update localStorage
    localStorage.setItem('currentPage', page);
    
    // Update URL hash without triggering a page reload
    window.history.pushState(null, '', `#${page}`);
    
    // Load the page content
    loadPage(page);
}

// Function to load page content
function loadPage(page) {
    fetch(`html/${page}_${getCurrentLanguage()}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            // Update active state in navigation
            updateActiveNavItem(page);
        })
        .catch(error => console.error('Error loading page:', error));
}

// Update active state in navigation
function updateActiveNavItem(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(page)) {
            link.classList.add('active');
        }
    });
}

// Handle page load and browser navigation
document.addEventListener('DOMContentLoaded', function() {
    // Check URL hash first, then localStorage, default to 'landing'
    const hash = window.location.hash.slice(1);
    const storedPage = localStorage.getItem('currentPage');
    const page = hash || storedPage || 'landing';
    
    // Load the appropriate page
    loadPage(page);
    
    // Store the current page
    localStorage.setItem('currentPage', page);
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    const page = window.location.hash.slice(1) || 'landing';
    loadPage(page);
    localStorage.setItem('currentPage', page);
});

// Get current language
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
} 