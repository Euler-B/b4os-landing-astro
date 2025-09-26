// Twitter Pixel Tracking for Legal Pages (Terms & Code of Conduct)
class LegalPagesTracker {
    constructor() {
        this.isReady = false;
        this.currentPage = this.detectPageType();
        this.init();
    }

    detectPageType() {
        const path = window.location.pathname;
        if (path.includes('terminos') || path.includes('terms')) {
            return 'terms';
        } else if (path.includes('codigo-conducta') || path.includes('conduct')) {
            return 'conduct';
        }
        return 'unknown';
    }

    init() {
        this.waitForTwitter(() => {
            this.isReady = true;
            this.trackPageView();
            this.setupScrollTracking();
            this.setupLinkTracking();
            this.setupButtonTracking();
            console.log(`Legal Pages Tracker initialized for: ${this.currentPage}`);
        });
    }

    waitForTwitter(callback, maxAttempts = 50) {
        let attempts = 0;
        const checkTwitter = () => {
            if (typeof window.twq !== 'undefined') {
                callback();
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkTwitter, 100);
            } else {
                console.warn('Twitter pixel not loaded after maximum attempts');
            }
        };
        checkTwitter();
    }

    trackPageView() {
        if (!this.isReady) return;

        const pageData = {
            terms: {
                content_type: 'legal_page',
                content_name: 'Terms and Conditions Page View',
                page_type: 'terms_conditions'
            },
            conduct: {
                content_type: 'legal_page',
                content_name: 'Code of Conduct Page View',
                page_type: 'code_of_conduct'
            }
        };

        const data = pageData[this.currentPage];
        if (data) {
            window.twq('event', 'view_content', data);
            console.log(`Tracked page view: ${data.content_name}`);
        }
    }

    setupScrollTracking() {
        let scrollThresholds = [25, 50, 75, 90, 100];
        let trackedThresholds = new Set();

        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            scrollThresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
                    this.trackScrollDepth(threshold);
                    trackedThresholds.add(threshold);
                }
            });
        };

        window.addEventListener('scroll', this.throttle(trackScroll, 500));
    }

    trackScrollDepth(percentage) {
        if (!this.isReady) return;

        const pageNames = {
            terms: 'Terms and Conditions',
            conduct: 'Code of Conduct'
        };

        window.twq('event', 'view_content', {
            content_type: 'scroll_depth',
            content_name: `${pageNames[this.currentPage]} - ${percentage}% Scrolled`,
            scroll_percentage: percentage,
            page_type: this.currentPage
        });

        console.log(`Tracked scroll: ${percentage}% on ${this.currentPage}`);
    }

    setupLinkTracking() {
        // Track external links
        document.querySelectorAll('a[href^="http"], a[target="_blank"]').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackExternalLink(e.target.href);
            });
        });

        // Track internal navigation links
        document.querySelectorAll('a[href^="/"], a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackInternalLink(e.target.href, e.target.textContent.trim());
            });
        });

        // Track email links
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackEmailClick(e.target.href);
            });
        });
    }

    setupButtonTracking() {
        // Track all buttons
        document.querySelectorAll('button, .btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = e.target.textContent.trim();
                const action = this.detectButtonAction(buttonText, e.target);
                this.trackButtonClick(buttonText, action);
            });
        });
    }

    detectButtonAction(buttonText, element) {
        const text = buttonText.toLowerCase();

        if (text.includes('close') || text.includes('cerrar')) {
            return 'close_page';
        } else if (text.includes('register') || text.includes('registro')) {
            return 'navigate_to_registration';
        } else if (text.includes('back') || text.includes('volver')) {
            return 'navigate_back';
        } else {
            return 'button_click';
        }
    }

    trackExternalLink(url) {
        if (!this.isReady) return;

        window.twq('event', 'click', {
            content_type: 'external_link',
            content_name: 'External Link from Legal Page',
            url: url,
            source_page: this.currentPage
        });
    }

    trackInternalLink(url, linkText) {
        if (!this.isReady) return;

        window.twq('event', 'click', {
            content_type: 'internal_link',
            content_name: `Internal Link: ${linkText}`,
            url: url,
            source_page: this.currentPage
        });
    }

    trackEmailClick(email) {
        if (!this.isReady) return;

        window.twq('event', 'lead', {
            content_type: 'email_contact',
            content_name: 'Email Contact from Legal Page',
            email: email.replace('mailto:', ''),
            source_page: this.currentPage
        });
    }

    trackButtonClick(buttonText, action) {
        if (!this.isReady) return;

        window.twq('event', 'click', {
            content_type: 'button',
            content_name: `Button: ${buttonText}`,
            button_action: action,
            source_page: this.currentPage
        });

        // Special tracking for registration navigation
        if (action === 'navigate_to_registration') {
            window.twq('event', 'lead', {
                content_type: 'registration_intent',
                content_name: 'Registration Intent from Legal Page',
                source_page: this.currentPage
            });
        }
    }

    // Utility function for throttling scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Public method to track custom events
    trackCustomEvent(eventType, data = {}) {
        if (!this.isReady) return;

        window.twq('event', eventType, {
            ...data,
            source_page: this.currentPage
        });
    }
}

// Initialize only on legal pages
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        if (path.includes('terminos') || path.includes('terms') ||
            path.includes('codigo-conducta') || path.includes('conduct')) {
            window.legalPagesTracker = new LegalPagesTracker();
        }
    });
} else {
    const path = window.location.pathname;
    if (path.includes('terminos') || path.includes('terms') ||
        path.includes('codigo-conducta') || path.includes('conduct')) {
        window.legalPagesTracker = new LegalPagesTracker();
    }
}

// Export for global access
window.LegalPagesTracker = LegalPagesTracker;