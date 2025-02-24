// Create a new file for browser compatibility
class BrowserCompatibility {
    static check() {
        const issues = this.checkFeatures();
        if (issues.length > 0) {
            this.showWarning(issues);
        }
    }

    static checkFeatures() {
        const issues = [];

        // Check modern JavaScript features
        const jsFeatures = {
            'Async/Await': async () => {},
            'Promises': window.Promise,
            'Modules': 'noModule' in document.createElement('script'),
            'Classes': class {}.constructor
        };

        // Check CSS features
        const cssFeatures = {
            'Grid': this.checkCSSProperty('display', 'grid'),
            'Flexbox': this.checkCSSProperty('display', 'flex'),
            'Variables': this.checkCSSProperty('--test', '0'),
            'Transitions': this.checkCSSProperty('transition', 'all')
        };

        // Check API support
        const apiFeatures = {
            'LocalStorage': 'localStorage' in window,
            'ServiceWorker': 'serviceWorker' in navigator,
            'Fetch': 'fetch' in window,
            'IntersectionObserver': 'IntersectionObserver' in window
        };

        // Check each feature category
        for (const [feature, test] of Object.entries(jsFeatures)) {
            if (!test) issues.push(`JavaScript: ${feature}`);
        }
        for (const [feature, supported] of Object.entries(cssFeatures)) {
            if (!supported) issues.push(`CSS: ${feature}`);
        }
        for (const [feature, supported] of Object.entries(apiFeatures)) {
            if (!supported) issues.push(`API: ${feature}`);
        }

        return issues;
    }

    static checkCSSProperty(property, value) {
        const element = document.createElement('div');
        element.style[property] = value;
        return element.style[property] === value;
    }

    static showWarning(issues) {
        const warning = document.createElement('div');
        warning.className = 'browser-warning';
        warning.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <h4>Browser Compatibility Notice</h4>
                <p>Your browser might have limited support for some features:</p>
                <ul>
                    ${issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
                <p>For the best experience, please use a modern browser.</p>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        document.body.insertBefore(warning, document.body.firstChild);
    }
} 