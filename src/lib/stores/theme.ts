import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
    const { subscribe, set } = writable<Theme>('system');

    if (browser) {
        // Initialize state
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        let activeTheme: Theme = storedTheme || 'system';
        set(activeTheme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = (theme: Theme) => {
            const isDark =
                theme === 'dark' || (theme === 'system' && mediaQuery.matches);
            document.documentElement.classList.toggle('dark', isDark);
        };

        // Initial apply
        applyTheme(activeTheme);

        // Listen for system changes
        const handleSystemChange = () => {
            // We need to check the current value of the store, but we can't easily subscribe inside here without creating a leak or circular dependency easily.
            // However, "activeTheme" variable in this scope captures the *initial* value.
            // We need the *current* value.
            // Let's use localStorage as the source of truth for the *intent*, effectively.
            const currentStored = localStorage.getItem('theme') as Theme | null;
            const currentTheme = currentStored || 'system';

            if (currentTheme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleSystemChange);

        return {
            subscribe,
            set: (newTheme: Theme) => {
                activeTheme = newTheme; // Update local tracker if needed, mostly for logic sync

                if (newTheme === 'system') {
                    localStorage.removeItem('theme');
                } else {
                    localStorage.setItem('theme', newTheme);
                }

                applyTheme(newTheme);
                set(newTheme);
            }
        };
    }

    return {
        subscribe,
        set: (value: Theme) => { }
    };
}

export const theme = createThemeStore();
