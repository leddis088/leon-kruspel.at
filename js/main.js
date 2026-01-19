/* main.js - Global site functions: theme toggling, language, cookies, etc. */

let currentLanguage = 'en'; // default language
let currentPage = 'landing'; // Add this to track current page

// Queue for early navigateTo calls (before function is defined)
let navigateToQueue = [];

// Store/retrieve cookies
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/; Secure; SameSite=Lax`;
}

function getCookie(name) {
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  const search = name + "=";
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(search) === 0) {
      return c.substring(search.length, c.length);
    }
  }
  return "";
}

// Translation object for navbar and UI elements
const translations = {
  en: {
    navProjects: 'Projects',
    navAbout: 'About',
    navImprint: 'Imprint',
    toggleDarkMode: 'Dark Mode',
    language: 'Language',
    toggleNavigation: 'Toggle navigation'
  },
  de: {
    navProjects: 'Projekte',
    navAbout: 'Über mich',
    navImprint: 'Impressum',
    toggleDarkMode: 'Dunkler Modus',
    language: 'Sprache',
    toggleNavigation: 'Navigation umschalten'
  }
};

// Function to update navbar translations
function updateNavbarLanguage(lang) {
  const langData = translations[lang] || translations.en;
  
  // Set body data attribute for CSS targeting
  document.body.setAttribute('data-lang', lang);
  
  // Update all elements with data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (langData[key]) {
      // Only update text content, preserve icon elements
      const textSpan = element.querySelector('span');
      if (textSpan) {
        textSpan.textContent = langData[key];
      } else {
        element.textContent = langData[key];
      }
    }
  });
  
  // Update aria-label for toggle button
  const toggleButton = document.querySelector('[data-bs-toggle="collapse"]');
  if (toggleButton && langData.toggleNavigation) {
    toggleButton.setAttribute('aria-label', langData.toggleNavigation);
  }
  
  // Update active language indicator in dropdown (old and new structure)
  document.querySelectorAll('.language-option, .settings-language-option').forEach(item => {
    const itemLang = item.getAttribute('data-lang');
    if (itemLang === lang) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/*
  setLanguage is defined here so other scripts (like index.js) can call it too.
  If reloadPage is true, it calls navigateTo("landing") to refresh content in new lang.
*/
function setLanguage(lang, reloadPage = true) {
  currentLanguage = lang;
  setCookie("lang", lang, 365);
  
  // Update navbar language immediately
  updateNavbarLanguage(lang);
  
  if (reloadPage) {
    navigateTo(currentPage); // Use tracked page instead of defaulting to landing
  }
}

// Called on body onload
function initSite() {
    // Initialize error handler first to catch any errors
    if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.init();
        
        // Register error handlers after ErrorHandler is initialized
        window.addEventListener('error', function(e) {
            // Ignore certain errors
            if (e.filename?.includes('chrome-extension://') || 
                e.message?.includes('web_accessible_resources') ||
                (e.message?.includes('404') && e.message?.includes('.jpg')) ||
                e.message?.includes('ResizeObserver') ||
                e.message?.includes('Non-Error promise rejection')) {
                return;
            }
            
            // Only show errors after page is fully loaded
            if (document.readyState !== 'complete') {
                return;
            }
            
            if (typeof ErrorHandler !== 'undefined' && ErrorHandler.handleGlobalError) {
                ErrorHandler.handleGlobalError(
                    e.message || 'Unknown error',
                    e.filename,
                    e.lineno,
                    e.colno,
                    e.error
                );
            }
        }, true);

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', function(e) {
            // Ignore certain rejections
            if (e.reason?.message?.includes('chrome-extension') ||
                (e.reason?.message?.includes('404') && e.reason?.message?.includes('.jpg')) ||
                e.reason?.message?.includes('ResizeObserver') ||
                e.reason?.message?.includes('Non-Error promise rejection')) {
                e.preventDefault();
                return;
            }
            
            // Only show errors after page is fully loaded
            if (document.readyState !== 'complete') {
                e.preventDefault();
                return;
            }
            
            if (typeof ErrorHandler !== 'undefined' && ErrorHandler.handlePromiseRejection) {
                ErrorHandler.handlePromiseRejection(e);
            }
        });
    }

    // Check cookies and localStorage for saved preferences
    const savedTheme = getCookie("theme");
    const savedLang = getCookie("lang");

    // Apply theme
    if (savedTheme === "dark") {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
        const themeSwitch = document.getElementById("themeSwitch");
        if (themeSwitch) themeSwitch.checked = true;
    }

    // Apply language
    if (savedLang === "de") {
        setLanguage("de", false);
    } else {
        setLanguage("en", false);
    }
    
    // Update navbar language on initial load
    const currentLang = getCookie("lang") || "en";
    updateNavbarLanguage(currentLang);

    // Determine which page to load
    const hash = window.location.hash.slice(1);
    const storedPage = localStorage.getItem('currentPage');
    const pageToLoad = (hash && ['landing', 'projects', 'about', 'imprint'].includes(hash)) 
        ? hash 
        : (storedPage && ['landing', 'projects', 'about', 'imprint'].includes(storedPage))
        ? storedPage
        : 'landing';
    
    currentPage = pageToLoad;
    
    // Scroll to top on page load
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Navigate to the current page
    // Functions are hoisted, so navigateTo should be available
    // Use a small delay to ensure everything is initialized
    setTimeout(() => {
        // Try window.navigateTo first (set at end of script), then local function
        const navFunc = window.navigateTo || navigateTo;
        if (typeof navFunc === 'function') {
            navFunc(currentPage);
        } else {
            console.error('navigateTo function not available');
            // Last resort: try to load landing page manually
            const contentDiv = document.getElementById("content");
            if (contentDiv) {
                const lang = getCookie("lang") || "en";
                fetch(`html/landing_${lang}.html`)
                    .then(response => response.text())
                    .then(html => {
                        contentDiv.innerHTML = html;
                        // Ensure scroll to top after content loads
                        window.scrollTo({ top: 0, behavior: 'instant' });
                    })
                    .catch(err => {
                        console.error('Failed to load landing page:', err);
                        contentDiv.innerHTML = '<div class="mt-4"><h1>Welcome</h1><p>Please refresh the page if content does not load.</p></div>';
                    });
            }
        }
    }, 10);

    // Initialize features
    if (typeof initTouchEvents === 'function') {
        initTouchEvents();
    }
    if (typeof ImageHandler !== 'undefined' && typeof ImageHandler.init === 'function') {
        ImageHandler.init();
    }
    if (typeof BrowserCompatibility !== 'undefined' && typeof BrowserCompatibility.check === 'function') {
        BrowserCompatibility.check();
    }
}

// Toggle theme (called by the theme switch in HTML)
function toggleTheme() {
  const isDark = document.body.classList.contains("dark-theme");
  if (isDark) {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    setCookie("theme", "light", 365);
  } else {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    setCookie("theme", "dark", 365);
  }
}

// Update navigateTo to ensure currentPage is always set
// This is the main navigation function - must be globally available
// Make it globally available immediately
function navigateTo(pageName) {
    // Ensure content div exists
    const contentDiv = document.getElementById("content");
    if (!contentDiv) {
        console.warn("Content div not found, waiting for DOM...");
        // Wait a bit for DOM to be ready
        setTimeout(() => navigateTo(pageName), 100);
        return;
    }

    // Validate page name
    const validPages = ['landing', 'projects', 'about', 'imprint'];
    if (!validPages.includes(pageName)) {
        pageName = 'landing';
    }

    // Update current page and storage
    currentPage = pageName;
    localStorage.setItem('currentPage', pageName);
    
    // Update URL hash without triggering a page reload
    if (window.location.hash !== `#${pageName}`) {
        window.history.pushState(null, '', `#${pageName}`);
    }
    
    const lang = getCookie("lang") || "en";
    let fileToLoad = `html/${pageName}_${lang}.html`;

    fetch(fileToLoad)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then((htmlData) => {
            contentDiv.innerHTML = htmlData;
            contentDiv.classList.add("fade-in");
            
            // Scroll to top of page
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            setTimeout(() => {
                contentDiv.classList.remove("fade-in");
            }, 300);
            
            // Update active state in navigation after content loads
            updateActiveNavItem(pageName);
            
            // Reinitialize any page-specific features
            if (typeof handleMissingImages === 'function') {
                handleMissingImages();
            }
            if (typeof initTouchEvents === 'function') {
                initTouchEvents();
            }
            
            // Reinitialize image handlers after content loads
            initializeImageHandlers();
            
            // Fix image loading states
            fixImageLoadingStates();
        })
        .catch((err) => {
            console.error("Error loading page:", err);
            // Only show error if it's not the landing page
            if (pageName !== 'landing') {
                navigateTo('landing');
            } else {
                // If landing page fails, show a basic message
                contentDiv.innerHTML = '<div class="mt-4"><h1>Welcome</h1><p>Content loading...</p></div>';
            }
        });
}

// Make navigateTo globally available
window.navigateTo = navigateTo;

// Process any queued calls that happened before the function was defined
if (Array.isArray(navigateToQueue) && navigateToQueue.length > 0) {
    const queue = [...navigateToQueue]; // Copy the queue
    navigateToQueue = []; // Clear the queue
    // Process queued calls after a short delay to ensure DOM is ready
    setTimeout(() => {
        queue.forEach(pageName => {
            navigateTo(pageName);
        });
    }, 0);
}

// Get current language - consolidate this function
function getCurrentLanguage() {
    return getCookie("lang") || 'en';
}

// Update active state in navigation
function updateActiveNavItem(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const onclick = link.getAttribute('onclick');
        if (onclick && onclick.includes(`'${page}'`)) {
            link.classList.add('active');
        }
    });
}

// Add this function
function handleImageError(img) {
  img.onerror = null; // Prevent infinite loop
  img.src = 'img/placeholder.jpg';
}

// Update image loading in project modals
document.querySelectorAll('.gallery-image').forEach(img => {
  img.onerror = () => handleImageError(img);
});

// Update the service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', {  // Move to root
      scope: '/'
    }).catch(error => {
      console.log('ServiceWorker registration failed:', error);
    });
  });
}


// Add touch event support
function initTouchEvents() {
  const projectItems = document.querySelectorAll('.project-item');
  
  projectItems.forEach(item => {
    item.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    }, { passive: true });

    item.addEventListener('touchend', function() {
      this.classList.remove('touch-active');
    }, { passive: true });
  });
}

// Add browser compatibility check
function checkBrowserSupport() {
  const unsupportedBrowser = document.createElement('div');
  unsupportedBrowser.className = 'browser-warning';
  unsupportedBrowser.innerHTML = `
    <div class="alert alert-warning" role="alert">
      <h4>Browser Compatibility Notice</h4>
      <p>Your browser might not support all features. For the best experience, please use a modern browser like Chrome, Firefox, Safari, or Edge.</p>
    </div>
  `;

  // Check for basic modern features
  const modernFeatures = [
    'CSS' in window,
    'querySelector' in document,
    'addEventListener' in window,
    'localStorage' in window
  ];

  if (!modernFeatures.every(Boolean)) {
    document.body.prepend(unsupportedBrowser);
  }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    const cookieNotice = document.querySelector('.cookie-notice');
    if (cookieNotice) {
        cookieNotice.remove();
    }
}

function rejectCookies() {
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    // Clear localStorage except for essential items
    localStorage.clear();
    // Reload page
    window.location.reload();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    const page = window.location.hash.slice(1) || 'landing';
    if (['landing', 'projects', 'about', 'imprint'].includes(page)) {
        navigateTo(page);
    }
});

// Initialize image handlers for gallery images
function initializeImageHandlers() {
    // Add click handlers to gallery images for fullscreen view
    document.querySelectorAll('.gallery-image').forEach(img => {
        // Remove existing handlers to avoid duplicates
        const newImg = img.cloneNode(true);
        img.parentNode.replaceChild(newImg, img);
        
        // Add click handler for fullscreen view
        newImg.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            if (typeof openFullScreenImage === 'function') {
                openFullScreenImage(this.src);
            }
        });
        
        // Add cursor pointer style
        newImg.style.cursor = 'pointer';
    });
}

// Fix image loading states - remove loading class when images load
function fixImageLoadingStates() {
    const images = document.querySelectorAll('.gallery-image, img[class*="loading"]');
    images.forEach(img => {
        // If image is already loaded, remove loading class
        if (img.complete && img.naturalHeight !== 0) {
            img.classList.remove('loading');
            // Hide placeholder spinner if it exists
            const placeholder = img.parentElement?.querySelector('.image-placeholder, .fa-spinner');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        } else {
            // Add load handler to remove loading class when image loads
            img.addEventListener('load', function() {
                this.classList.remove('loading');
                // Hide placeholder spinner
                const placeholder = this.parentElement?.querySelector('.image-placeholder, .fa-spinner');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            });
            
            // Add error handler
            img.addEventListener('error', function() {
                this.classList.remove('loading');
                // Hide placeholder spinner
                const placeholder = this.parentElement?.querySelector('.image-placeholder, .fa-spinner');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                // Set placeholder image if not already set
                if (!this.src.includes('placeholder.jpg')) {
                    this.src = 'img/placeholder.jpg';
                }
            });
        }
    });
}

// Make openFullScreenImage globally available if it doesn't exist
if (typeof window.openFullScreenImage === 'undefined') {
    window.openFullScreenImage = function(imageSrc) {
        const fullScreenModal = document.createElement('div');
        fullScreenModal.className = 'fullscreen-modal';
        fullScreenModal.innerHTML = `
            <div class="fullscreen-content">
                <span class="close-fullscreen">&times;</span>
                <img src="${imageSrc}" alt="Full-size image">
            </div>
        `;
        
        document.body.appendChild(fullScreenModal);
        document.body.style.overflow = 'hidden';
        
        // Close on click outside
        fullScreenModal.addEventListener('click', function(e) {
            if (e.target === fullScreenModal) {
                document.body.removeChild(fullScreenModal);
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close on close button click
        const closeBtn = fullScreenModal.querySelector('.close-fullscreen');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(fullScreenModal);
                document.body.style.overflow = 'auto';
            });
        }
        
        // Close on Escape key
        const escapeHandler = function(e) {
            if (e.key === 'Escape') {
                if (document.body.contains(fullScreenModal)) {
                    document.body.removeChild(fullScreenModal);
                    document.body.style.overflow = 'auto';
                    document.removeEventListener('keydown', escapeHandler);
                }
            }
        };
        document.addEventListener('keydown', escapeHandler);
    };
}
