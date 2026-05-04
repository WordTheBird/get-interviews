// Theme management — runs before the page paints to prevent flicker
(function() {
    const STORAGE_KEY = 'gi-theme'; // 'light', 'dark', or null (system)

    function getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function getStoredPreference() {
        return localStorage.getItem(STORAGE_KEY);
    }

    function applyTheme(theme) {
        const effective = theme === 'system' || !theme ? getSystemPreference() : theme;
        document.documentElement.classList.toggle('dark', effective === 'dark');
    }

    // Apply immediately on load
    applyTheme(getStoredPreference() || 'system');

    // Listen for OS theme changes when in 'system' mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (!getStoredPreference()) {
            applyTheme('system');
        }
    });

    // Public API
    window.Theme = {
        set(theme) {
            if (theme === 'system') {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(STORAGE_KEY, theme);
            }
            applyTheme(theme);
            updateToggleButton();
        },
        current() {
            return getStoredPreference() || 'system';
        },
        effective() {
            const stored = getStoredPreference();
            return stored && stored !== 'system' ? stored : getSystemPreference();
        }
    };

    function updateToggleButton() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        const effective = window.Theme.effective();
        const stored = window.Theme.current();
        btn.setAttribute('aria-label', `Theme: ${stored}. Click to change.`);
        btn.querySelector('.theme-icon').innerHTML = effective === 'dark'
            ? sunIcon()
            : moonIcon();
    }

    function sunIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;
    }
    function moonIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;
    }

    document.addEventListener('DOMContentLoaded', updateToggleButton);
})();