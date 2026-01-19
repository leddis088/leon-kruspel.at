// Get current language for cookie notice - local function
function getCookieNoticeLanguage() {
    // Try to get language from cookie first
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        if (cookie.startsWith('lang=')) {
            return cookie.split('=')[1] || 'en';
        }
    }
    // Then check localStorage
    const storedLang = localStorage.getItem('language');
    if (storedLang) {
        return storedLang;
    }
    // Default to English
    return 'en';
}

function showCookieNotice() {
    console.log('Checking cookie consent...', localStorage.getItem('cookieConsent'));

    if (!localStorage.getItem('cookieConsent')) {
        console.log('No cookie consent found, showing notice...');
        const language = getCookieNoticeLanguage();
        const content = getCookieNoticeContent(language);

        const cookieNotice = document.createElement('div');
        cookieNotice.className = 'cookie-notice';
        cookieNotice.innerHTML = `
            <div class="cookie-notice-content">
                <h3>${content.title}</h3>
                <p>${content.description}</p>
                <h4>${content.essentialTitle}</h4>
                <ul>
                    ${Object.entries(content.cookies).map(([key, value]) =>
                        `<li><strong>${key}</strong>: ${value}</li>`
                    ).join('')}
                </ul>
                <p>${content.dataUsage}</p>
                <p>${content.retention}</p>
                <p>${content.rights}</p>
                <div class="cookie-actions">
                    <button onclick="acceptCookies()" class="btn btn-primary">${content.accept}</button>
                    <button onclick="rejectCookies()" class="btn btn-secondary">${content.reject}</button>
                </div>
            </div>
        `;

        document.body.appendChild(cookieNotice);
        console.log('Cookie notice added to page');
    } else {
        console.log('Cookie consent already given:', localStorage.getItem('cookieConsent'));
    }
}

// Make functions globally available
window.acceptCookies = function acceptCookies() {
    console.log('Cookies accepted');
    localStorage.setItem('cookieConsent', 'accepted');
    const notice = document.querySelector('.cookie-notice');
    if (notice) {
        notice.remove();
    }
};

window.rejectCookies = function rejectCookies() {
    console.log('Cookies rejected');

    // First, clear all existing cookies except the rejection cookie
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name !== 'cookieConsent') {
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
    }

    // Set the rejection cookie (store rejection state)
    const d = new Date();
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
    const expires = "expires=" + d.toUTCString();
    document.cookie = `cookieConsent=rejected; ${expires}; path=/; SameSite=Lax`;

    // Also set in localStorage as backup
    localStorage.setItem('cookieConsent', 'rejected');

    const notice = document.querySelector('.cookie-notice');
    if (notice) {
        notice.remove();
    }
};

// Show the notice when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired in cookie-notice.js');
    // Small delay to ensure DOM is fully ready
    setTimeout(function() {
        showCookieNotice();
    }, 100);
});

// Also try on window load as backup
window.addEventListener('load', function() {
    console.log('Window load fired in cookie-notice.js');
    // Only show if not already shown
    setTimeout(function() {
        if (!document.querySelector('.cookie-notice') && !localStorage.getItem('cookieConsent')) {
            console.log('Showing cookie notice from window.load');
            showCookieNotice();
        }
    }, 200);
});

// Emergency fallback - check after 1 second
setTimeout(function() {
    if (!document.querySelector('.cookie-notice') && !localStorage.getItem('cookieConsent')) {
        console.log('Emergency fallback: showing cookie notice');
        showCookieNotice();
    }
}, 1000);

// Add this function to get the correct content based on language
function getCookieNoticeContent(language) {
    const content = {
        en: {
            title: 'Cookie Settings',
            description: 'This website uses essential cookies and local storage to ensure proper functionality. We do not use any tracking or analytics cookies.',
            essentialTitle: 'Essential Cookies & Storage:',
            cookies: {
                currentPage: 'Stores your current page position (Local Storage)',
                language: 'Stores your language preference (Cookie, 1 year)',
                theme: 'Stores your theme preference (Cookie, 1 year)',
                cookieConsent: 'Stores your cookie preferences (Cookie, 1 year)'
            },
            dataUsage: 'Your data remains on your device and is not shared with third parties.',
            retention: 'Cookies are stored for 1 year. Local storage data remains until browser data is cleared.',
            rights: 'You can clear cookies and local storage through your browser settings at any time.',
            accept: 'Accept Essential Cookies',
            reject: 'Reject'
        },
        de: {
            title: 'Cookie-Einstellungen',
            description: 'Diese Website verwendet essentielle Cookies und lokalen Speicher für die grundlegende Funktionalität. Wir verwenden keine Tracking- oder Analyse-Cookies.',
            essentialTitle: 'Essentielle Cookies & Speicher:',
            cookies: {
                currentPage: 'Speichert Ihre aktuelle Seitenposition (Lokaler Speicher)',
                language: 'Speichert Ihre Spracheinstellung (Cookie, 1 Jahr)',
                theme: 'Speichert Ihre Theme-Einstellung (Cookie, 1 Jahr)',
                cookieConsent: 'Speichert Ihre Cookie-Präferenzen (Cookie, 1 Jahr)'
            },
            dataUsage: 'Ihre Daten verbleiben auf Ihrem Gerät und werden nicht an Dritte weitergegeben.',
            retention: 'Cookies werden für 1 Jahr gespeichert. Lokale Speicherdaten bleiben erhalten, bis die Browserdaten gelöscht werden.',
            rights: 'Sie können Cookies und lokalen Speicher jederzeit über Ihre Browsereinstellungen löschen.',
            accept: 'Essentielle Cookies akzeptieren',
            reject: 'Ablehnen'
        }
    };
    return content[language] || content.en;
} 