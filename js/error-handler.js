// Create a new file for centralized error handling
class ErrorHandler {
    static init() {
        window.onerror = this.handleGlobalError.bind(this);
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
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

    static showUserError(msg) {
        const errorContainer = document.getElementById('error-container') || 
            this.createErrorContainer();
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message fade-out';
        errorMsg.textContent = this.getUserFriendlyMessage(msg);
        
        errorContainer.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 5000);
    }

    static createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'error-container';
        document.body.appendChild(container);
        return container;
    }

    static getUserFriendlyMessage(technicalMsg = '') {
        // Ensure technicalMsg is a string
        const message = String(technicalMsg || '');
        
        const errorMap = {
            'NetworkError': 'Connection issue. Please check your internet connection.',
            'TypeError': 'Something went wrong. Please try again.',
            'SecurityError': 'Security check failed. Please refresh the page.',
            'Failed to fetch': 'Unable to load resource. Please check your connection.',
            '404': 'Resource not found.',
            'undefined': 'An unexpected error occurred.'
        };

        for (const [key, value] of Object.entries(errorMap)) {
            if (message.includes(key)) return value;
        }
        return 'An unexpected error occurred. Please try again.';
    }
} 