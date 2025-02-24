// Create a new file for image handling
class ImageHandler {
    static init() {
        this.setupLazyLoading();
        this.setupProgressiveLoading();
        this.preloadVisibleImages();
        this.addLoadingIndicators();
    }

    static setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
            img.classList.add('lazy-loading');
        });
    }

    static handleBrokenImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.onerror = () => this.handleImageError(img);
            if (img.complete && img.naturalHeight === 0) {
                this.handleImageError(img);
            }
        });
    }

    static handleImageError(img) {
        // Try fallback first
        const fallback = img.getAttribute('data-fallback');
        if (fallback && img.src !== fallback) {
            img.src = fallback;
            return;
        }

        // Use placeholder as last resort
        if (img.src !== '/img/placeholder.jpg') {
            img.src = '/img/placeholder.jpg';
            img.classList.add('image-error');
        }
    }

    static setupProgressiveLoading() {
        const images = document.querySelectorAll('.progressive-image');
        images.forEach(img => {
            // Load low-quality placeholder
            const placeholder = img.dataset.placeholder;
            if (placeholder) {
                img.src = placeholder;
                
                // Load high-quality image
                const highQuality = new Image();
                highQuality.src = img.dataset.src;
                highQuality.onload = () => {
                    img.src = highQuality.src;
                    img.classList.add('loaded');
                };
            }
        });
    }

    static generatePlaceholder(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width || 300;
        canvas.height = img.height || 200;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        ctx.fillStyle = '#999';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(img.alt || 'Image not available', canvas.width/2, canvas.height/2);
        
        return canvas.toDataURL();
    }

    static setupImageFallbacks() {
        const imageMap = {
            'proxmox-cluster.jpg': '/img/fallbacks/server.jpg',
            'network-setup.jpg': '/img/fallbacks/network.jpg',
            // Add other specific image mappings
        };

        document.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                const filename = src.split('/').pop();
                if (imageMap[filename]) {
                    img.setAttribute('data-fallback', imageMap[filename]);
                }
            }
            
            img.onerror = () => this.handleImageError(img);
        });
    }

    static preloadVisibleImages() {
        const images = Array.from(document.querySelectorAll('.gallery-image'))
            .filter(img => this.isInViewport(img));
        
        images.forEach(img => {
            if (!img.complete) {
                img.classList.add('loading');
            }
            
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'image';
            preloadLink.href = img.src;
            document.head.appendChild(preloadLink);
        });
    }

    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    static addLoadingIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .lazy-loading {
                opacity: 0;
                transition: opacity 0.3s ease-in;
            }
            .lazy-loading.loaded {
                opacity: 1;
            }
            .loading {
                opacity: 0.6;
                transition: opacity 0.3s ease;
            }
            .loaded {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        document.querySelectorAll('img').forEach(img => {
            if (!img.complete) {
                img.classList.add('loading');
            }
            img.onload = () => {
                img.classList.remove('loading');
                img.classList.add('loaded');
            };
        });
    }
} 