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

        // Log detailed error information
        console.group('🔴 Error Detected');
        console.error('Message:', errorDetails.message);
        console.error('Source:', errorDetails.url);
        console.error('Line:', errorDetails.lineNo, 'Column:', errorDetails.columnNo);
        if (error && error.stack) {
            console.error('Stack trace:', error.stack);
        }
        console.groupEnd();

        // Show user-friendly error message with details
        const fullErrorMsg = `${errorDetails.message} (at ${errorDetails.url}:${errorDetails.lineNo}:${errorDetails.columnNo})`;
        this.showUserError(fullErrorMsg);
        return false;
    }

    static handlePromiseRejection(event) {
        if (this.shouldIgnoreError(event.reason?.message, event.reason?.stack)) {
            event.preventDefault();
            return;
        }

        // Log detailed promise rejection information
        console.group('🔴 Promise Rejection');
        console.error('Reason:', event.reason);
        if (event.reason?.stack) {
            console.error('Stack trace:', event.reason.stack);
        }
        console.groupEnd();

        // Show error to user
        const errorMsg = event.reason?.message || String(event.reason) || 'Promise rejection';
        this.showUserError(`Promise Error: ${errorMsg}`);
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

        // Show both user-friendly message and technical details
        const technicalDetails = String(msg || 'Unknown error');
        errorMsg.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 0.5rem;">${userMsg}</div>
            <div style="font-size: 0.85rem; opacity: 0.8; font-family: monospace;">
                Technical: ${technicalDetails}
            </div>
        `;

        errorContainer.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 8000);
    }
} 