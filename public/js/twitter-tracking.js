// Twitter Pixel Section Tracking
class TwitterSectionTracker {
    constructor() {
        this.sections = [
            { id: 'inicio', name: 'Hero Section' },
            { id: 'objectives', name: 'Objectives Section' },
            { id: 'alumni', name: 'Alumni Section' },
            { id: 'residencias', name: 'Residencies Section' },
            { id: 'cronograma', name: 'Timeline Section' },
            { id: 'registro', name: 'Registration Section' },
            { id: 'beneficios', name: 'Benefits Section' },
            { id: 'alianzas', name: 'Partnerships Section' },
            { id: 'carreras', name: 'Careers Section' },
            { id: 'contacto', name: 'Contact Section' }
        ];

        this.viewedSections = new Set();
        this.observer = null;
        this.isReady = false;

        this.init();
    }

    init() {
        // Wait for Twitter pixel to be ready
        this.waitForTwitter(() => {
            this.isReady = true;
            this.setupIntersectionObserver();
            this.setupClickTracking();
            this.setupFormTracking();
            console.log('Twitter Section Tracker initialized');
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

    setupIntersectionObserver() {
        // Create intersection observer to track section views
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const sectionId = entry.target.id;
                    if (!this.viewedSections.has(sectionId)) {
                        this.trackSectionView(sectionId);
                        this.viewedSections.add(sectionId);
                    }
                }
            });
        }, {
            threshold: 0.5, // Trigger when 50% of section is visible
            rootMargin: '0px 0px -10% 0px' // Trigger slightly before full view
        });

        // Observe all sections
        this.sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) {
                this.observer.observe(element);
            }
        });
    }

    setupClickTracking() {
        // Track navigation clicks
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = e.target.getAttribute('href').replace('#', '');
                this.trackSectionClick(target);
            });
        });

        // Track external links
        document.querySelectorAll('a[href^="http"], a[target="_blank"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const url = e.target.href;
                this.trackExternalClick(url);
            });
        });

        // Track CTA buttons
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = e.target.textContent.trim();
                const section = this.findNearestSection(e.target);
                this.trackCTAClick(buttonText, section);
            });
        });
    }

    setupFormTracking() {
        const form = document.getElementById('registrationForm');
        if (form) {
            // Track form start (first interaction)
            let formStarted = false;
            form.addEventListener('input', () => {
                if (!formStarted) {
                    this.trackFormStart();
                    formStarted = true;
                }
            }, { once: true });

            // Track form submission
            form.addEventListener('submit', (e) => {
                this.trackFormSubmit();
            });

            // Track individual field interactions
            const fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                field.addEventListener('focus', () => {
                    this.trackFieldFocus(field.name || field.id);
                });
            });
        }
    }

    trackSectionView(sectionId) {
        if (!this.isReady) return;

        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            window.twq('event', 'view_content', {
                content_type: 'section',
                content_name: section.name,
                content_id: sectionId
            });
            console.log(`Tracked section view: ${section.name}`);
        }
    }

    trackSectionClick(sectionId) {
        if (!this.isReady) return;

        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            window.twq('event', 'click', {
                content_type: 'navigation',
                content_name: `Navigate to ${section.name}`,
                content_id: sectionId
            });
        }
    }

    trackExternalClick(url) {
        if (!this.isReady) return;

        window.twq('event', 'click', {
            content_type: 'external_link',
            content_name: 'External Link Click',
            url: url
        });
    }

    trackCTAClick(buttonText, section) {
        if (!this.isReady) return;

        window.twq('event', 'click', {
            content_type: 'cta',
            content_name: buttonText,
            section: section
        });
    }

    trackFormStart() {
        if (!this.isReady) return;

        window.twq('event', 'lead', {
            content_type: 'form',
            content_name: 'Registration Form Started'
        });
    }

    trackFormSubmit() {
        if (!this.isReady) return;

        window.twq('event', 'complete_registration', {
            content_type: 'form',
            content_name: 'Registration Form Submitted'
        });
    }

    trackFieldFocus(fieldName) {
        if (!this.isReady) return;

        window.twq('event', 'view_content', {
            content_type: 'form_field',
            content_name: `Field Focus: ${fieldName}`,
            field_name: fieldName
        });
    }

    findNearestSection(element) {
        let current = element;
        while (current && current !== document.body) {
            if (current.id && this.sections.find(s => s.id === current.id)) {
                return current.id;
            }
            current = current.parentElement;
        }
        return 'unknown';
    }

    // Public method to track custom events
    trackCustomEvent(eventType, data = {}) {
        if (!this.isReady) return;

        window.twq('event', eventType, data);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.twitterTracker = new TwitterSectionTracker();
    });
} else {
    window.twitterTracker = new TwitterSectionTracker();
}

// Export for global access
window.TwitterSectionTracker = TwitterSectionTracker;