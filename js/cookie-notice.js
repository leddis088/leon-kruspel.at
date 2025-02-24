function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

function showCookieNotice() {
    if (!localStorage.getItem('cookieConsent')) {
        const language = getCurrentLanguage();
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
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.querySelector('.cookie-notice').remove();
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    document.querySelector('.cookie-notice').remove();
    // Optionally redirect to a cookie-free version or show limited functionality message
}

// Show the notice when the page loads
document.addEventListener('DOMContentLoaded', showCookieNotice);

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