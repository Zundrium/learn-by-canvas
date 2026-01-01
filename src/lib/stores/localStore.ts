import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export function localStore<T>(key: string, initialValue: T) {
    // Get stored value from localStorage if available
    const storedValue = browser ? localStorage.getItem(key) : null;
    const data = storedValue ? JSON.parse(storedValue) : initialValue;

    // Create a writable store
    const store = writable<T>(data);

    // Subscribe to changes and update localStorage
    if (browser) {
        store.subscribe((value) => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    }

    return store;
}
