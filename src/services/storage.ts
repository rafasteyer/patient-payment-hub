const STORAGE_PREFIX = 'ctm_';

export const storage = {
    get: <T>(key: string): T | null => {
        try {
            const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from storage', error);
            return null;
        }
    },

    set: <T>(key: string, value: T): void => {
        try {
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
            // Dispatch event for reactive updates across tabs/components if needed
            window.dispatchEvent(new Event('storage-update'));
        } catch (error) {
            console.error('Error writing to storage', error);
        }
    },

    remove: (key: string): void => {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
        window.dispatchEvent(new Event('storage-update'));
    }
};
