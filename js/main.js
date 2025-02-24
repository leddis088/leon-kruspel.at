/* main.js - Global site functions: theme toggling, language, cookies, etc. */

let currentLanguage = 'en'; // default language
let currentPage = 'landing'; // Add this to track current page

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

/*
  setLanguage is defined here so other scripts (like index.js) can call it too.
  If reloadPage is true, it calls navigateTo("landing") to refresh content in new lang.
*/
function setLanguage(lang, reloadPage = true) {
  currentLanguage = lang;
  setCookie("lang", lang, 365);
  if (reloadPage) {
    navigateTo(currentPage); // Use tracked page instead of defaulting to landing
  }
}

// Called on body onload
function initSite() {
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

    // Navigate to the current page (which was set in DOMContentLoaded)
    navigateTo(currentPage);

    // Initialize features
    initTouchEvents();
    ErrorHandler.init();
    ImageHandler.init();
    BrowserCompatibility.check();
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
function navigateTo(pageName) {
    // Validate page name
    const validPages = ['landing', 'projects', 'about', 'imprint'];
    if (!validPages.includes(pageName)) {
        pageName = 'landing';
    }

    // Update current page and storage
    currentPage = pageName;
    localStorage.setItem('currentPage', pageName);
    
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
            const contentDiv = document.getElementById("content");
            contentDiv.innerHTML = htmlData;
            contentDiv.classList.add("fade-in");
            setTimeout(() => {
                contentDiv.classList.remove("fade-in");
            }, 300);
        })
        .catch((err) => {
            console.error("Error loading page:", err);
            if (pageName !== 'landing') {
                navigateTo('landing');
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

// Update error handling
window.addEventListener('error', function(e) {
    // Ignore certain errors
    if (e.filename?.includes('chrome-extension://') || 
        e.message?.includes('web_accessible_resources') ||
        e.message?.includes('404') && e.message?.includes('.jpg')) {
        return;
    }
    
    ErrorHandler.handleGlobalError(
        e.message || 'Unknown error',
        e.filename,
        e.lineno,
        e.colno,
        e.error
    );
}, true);

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    // Ignore certain rejections
    if (e.reason?.message?.includes('chrome-extension') ||
        e.reason?.message?.includes('404') && e.reason?.message?.includes('.jpg')) {
        return;
    }
    ErrorHandler.handlePromiseRejection(e);
});

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

// Add at the top of the file
document.addEventListener('DOMContentLoaded', function() {
    // Get saved page before any navigation occurs
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage && ['landing', 'projects', 'about', 'imprint'].includes(savedPage)) {
        currentPage = savedPage; // Set current page immediately
    }
});

