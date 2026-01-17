// Create a new file for centralized error handling
class ErrorHandler {
    static init() {
        // Error handlers are now registered in main.js after ErrorHandler is initialized
        // This prevents conflicts and ensures proper initialization order
        window.addEventListener('securitypolicyviolation', this.handleCSPViolation.bind(this));
    }

    static handleGlobalError(msg, url, lineNo, columnNo, error) {
        // Ignore certain browser extension errors
        if (this.shouldIgnoreError(msg, url)) return;

        // Ensure we have valid data
        const errorDetails = {
            message: msg || 'Unknown error',
            url: url || 'Unknown source',
            lineNo: lineNo || 0,
            columnNo: columnNo || 0,
            error: error || new Error('Unknown error')
        };

        // Log error details
        console.error('Error Details:', errorDetails);

        // Show user-friendly error message if needed
        this.showUserError(errorDetails.message);
        return false;
    }

    static handlePromiseRejection(event) {
        if (this.shouldIgnoreError(event.reason?.message, event.reason?.stack)) {
            event.preventDefault();
            return;
        }
        console.error('Promise Rejection:', event.reason);
    }

    static handleCSPViolation(event) {
        console.warn('CSP Violation:', {
            violatedDirective: event.violatedDirective,
            blockedURI: event.blockedURI
        });
    }

    static shouldIgnoreError(msg = '', url = '') {
        const ignoredPatterns = [
            'chrome-extension://',
            'ProximaNova',
            'web_accessible_resources',
            'ResizeObserver',
            'Permission denied to access property'
        ];
        return ignoredPatterns.some(pattern => 
            msg.includes(pattern) || url.includes(pattern)
        );
    }


    static createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'error-container';
        document.body.appendChild(container);
        return container;
    }

    static getUserFriendlyMessage(technicalMsg = '') {
        // Ensure technicalMsg is a string
        const message = String(technicalMsg || '').toLowerCase();
        
        // Ignore common non-critical errors that shouldn't be shown to users
        const ignorePatterns = [
            'resizeobserver',
            'non-error promise rejection',
            'loading chunk',
            'script error',
            'favicon',
            'placeholder'
        ];
        
        for (const pattern of ignorePatterns) {
            if (message.includes(pattern)) {
                return null; // Don't show this error
            }
        }
        
        const errorMap = {
            'networkerror': 'Connection issue. Please check your internet connection.',
            'typeerror': 'Something went wrong. Please try again.',
            'securityerror': 'Security check failed. Please refresh the page.',
            'failed to fetch': 'Unable to load resource. Please check your connection.',
            '404': 'Resource not found.'
        };

        for (const [key, value] of Object.entries(errorMap)) {
            if (message.includes(key)) return value;
        }
        
        // Only show generic error if it's a real error, not during initial page load
        // Check if we're still in the initial loading phase
        if (document.readyState === 'loading') {
            return null; // Suppress errors during initial page load
        }
        
        return 'An unexpected error occurred. Please try again.';
    }
    
    static showUserError(msg) {
        // Don't show error if getUserFriendlyMessage returned null
        const userMsg = this.getUserFriendlyMessage(msg);
        if (!userMsg) return;
        
        const errorContainer = document.getElementById('error-container') || 
            this.createErrorContainer();
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message fade-out';
        errorMsg.textContent = userMsg;
        
        errorContainer.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 5000);
    }
} 