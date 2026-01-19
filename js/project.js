/* project.js - Additional project filtering or advanced logic */

function filterProjects(criteria) {
  console.log("Filtering projects by:", criteria);
}

/* project.js - Project interactions and modal handling */

function openProjectModal(projectId) {
    const modal = document.getElementById(`${projectId}-modal`);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open

    // Shrink navbar when modal opens
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        navbar.classList.add('navbar-scrolled');
    }
}

function closeProjectModal(projectId) {
    const modal = document.getElementById(`${projectId}-modal`);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Restore navbar state based on scroll position
        if (typeof handleNavbarScroll === 'function') {
            handleNavbarScroll();
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('project-modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Restore navbar state based on scroll position
        if (typeof handleNavbarScroll === 'function') {
            handleNavbarScroll();
        }
    }
}

// Optional: Image gallery functionality
function openGalleryImage(imageSrc) {
    // Add functionality to show full-size images
}

// Handle image loading
document.addEventListener('DOMContentLoaded', function() {
    // Pre-load images for better user experience
    const preloadImages = () => {
        const images = document.querySelectorAll('.gallery-image');
        images.forEach(img => {
            if (img.complete) {
                img.classList.remove('loading');
            }
        });
    };

    preloadImages();
});

// Optional: Add image click handler for full-screen view
function openFullScreenImage(imageSrc) {
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

    // Shrink navbar when modal opens
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        navbar.classList.add('navbar-scrolled');
    }

    const closeFullscreen = function() {
        if (document.body.contains(fullScreenModal)) {
            document.body.removeChild(fullScreenModal);
            document.body.style.overflow = 'auto';
            // Restore navbar state based on scroll position
            if (typeof handleNavbarScroll === 'function') {
                handleNavbarScroll();
            }
        }
    };

    // Close on click outside (anywhere except the image itself)
    fullScreenModal.addEventListener('click', function(e) {
        // Close if clicked on the modal background or anywhere that's not the image
        if (e.target === fullScreenModal || e.target.classList.contains('fullscreen-content')) {
            closeFullscreen();
        }
    });

    // Close on close button click
    const closeBtn = fullScreenModal.querySelector('.close-fullscreen');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeFullscreen();
        });
    }

    // Close on Escape key
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeFullscreen();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Add click handlers to gallery images (this runs on initial page load)
// Note: After content is loaded via AJAX, initializeImageHandlers() in main.js will handle this
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeProjectImageHandlers();
    });
} else {
    initializeProjectImageHandlers();
}

function initializeProjectImageHandlers() {
    document.querySelectorAll('.gallery-image').forEach(img => {
        // Only add handler if it doesn't already have one
        if (!img.hasAttribute('data-handler-added')) {
            img.setAttribute('data-handler-added', 'true');
            img.style.cursor = 'pointer';
            img.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof window.openFullScreenImage === 'function') {
                    window.openFullScreenImage(this.src);
                } else if (typeof openFullScreenImage === 'function') {
                    openFullScreenImage(this.src);
                }
            });
        }
    });
}

// Add these functions to your existing project.js

function openInterestModal(interestId) {
    const modal = document.getElementById(`${interestId}-modal`);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Shrink navbar when modal opens
        const navbar = document.getElementById('mainNavbar');
        if (navbar) {
            navbar.classList.add('navbar-scrolled');
        }
    }
}

function closeInterestModal(interestId) {
    const modal = document.getElementById(`${interestId}-modal`);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Restore navbar state based on scroll position
        if (typeof handleNavbarScroll === 'function') {
            handleNavbarScroll();
        }
    }
}

// Update image loading function
function handleMissingImages() {
  const images = document.querySelectorAll('.gallery-image');
  const placeholderUrl = '/img/placeholder.jpg';

  images.forEach(img => {
    // Add loading attribute
    img.loading = 'lazy';
    
    // Add error handling
    img.onerror = function() {
      if (this.src !== placeholderUrl) {
        this.src = placeholderUrl;
      }
      this.classList.add('image-error');
    };

    // Check if image is already broken
    if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
      img.src = placeholderUrl;
      img.classList.add('image-error');
    }
  });
}

// Call this when content is loaded
document.addEventListener('DOMContentLoaded', handleMissingImages);

// Update keyboard event listener for ESC key
document.addEventListener('keydown', function(event) {
    // Only handle Escape key and when a modal is actually open
    if (event.key === 'Escape' && !event.repeat) {
        const openModals = Array.from(document.querySelectorAll('.project-modal, .fullscreen-modal'))
            .filter(modal => modal.style.display === 'block' || modal.style.display === 'flex');

        if (openModals.length > 0) {
            event.preventDefault(); // Prevent browser minimize
            openModals.forEach(modal => {
                if (modal.classList.contains('fullscreen-modal')) {
                    modal.remove();
                } else {
                    modal.style.display = 'none';
                }
            });
            document.body.style.overflow = 'auto';

            // Restore navbar state based on scroll position
            if (typeof handleNavbarScroll === 'function') {
                handleNavbarScroll();
            }
        }
    }
});

function closeFullScreenImage() {
    const fullscreenModal = document.querySelector('.fullscreen-modal');
    if (fullscreenModal) {
        fullscreenModal.remove();
        document.body.style.overflow = 'auto';

        // Restore navbar state based on scroll position
        if (typeof handleNavbarScroll === 'function') {
            handleNavbarScroll();
        }
    }
}

// Add touch event handling
function initTouchHandling() {
    // Prevent double-tap zoom on touch devices
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Improve modal scrolling on iOS
    const modals = document.querySelectorAll('.project-modal, .fullscreen-modal');
    modals.forEach(modal => {
        modal.addEventListener('touchmove', function(e) {
            e.stopPropagation();
        }, { passive: true });
    });

    // Add swipe to close for modals
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeDistance = touchEndY - touchStartY;
        const openModal = document.querySelector('.project-modal[style*="display: block"]');
        
        if (openModal && Math.abs(swipeDistance) > 100) {
            const modalContent = openModal.querySelector('.modal-content');
            const isAtTop = modalContent.scrollTop === 0;
            const isAtBottom = modalContent.scrollHeight - modalContent.scrollTop === modalContent.clientHeight;

            if ((swipeDistance > 0 && isAtTop) || (swipeDistance < 0 && isAtBottom)) {
                closeProjectModal(openModal.id.replace('-modal', ''));
            }
        }
    }
}

// Call this in your DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', function() {
    handleMissingImages();
    initTouchHandling();
});
