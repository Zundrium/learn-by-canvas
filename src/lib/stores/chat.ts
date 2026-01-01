import { writable, get } from 'svelte/store';
import { localStore } from './localStore';

export interface Message {
    role: 'user' | 'model' | 'system';
    text: string;
    toolCall?: {
        name: string;
        args: any;
    };
}

export interface Session {
    id: string;
    title: string;
    messages: Message[];
    canvasData?: any; // To restore canvas state if needed
    lastModified: number;
}

// Persist only the list of sessions
export const sessions = localStore<Session[]>('chat-sessions', []);
export const currentSessionId = writable<string | null>(null);

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

export const chatStore = {
    subscribe: sessions.subscribe,

    createNewSession: () => {
        const id = generateId();
        const newSession: Session = {
            id,
            title: 'New Chat',
            messages: [],
            lastModified: Date.now()
        };

        sessions.update(all => [newSession, ...all]);
        currentSessionId.set(id);
        return id;
    },

    deleteSession: (id: string) => {
        sessions.update(all => all.filter(s => s.id !== id));
        const current = get(currentSessionId);
        if (current === id) {
            currentSessionId.set(null);
        }
    },

    updateSessionMessages: (id: string, messages: Message[]) => {
        sessions.update(all => {
            return all.map(s => {
                if (s.id === id) {
                    // Auto-generate title from first user message if it's "New Chat"
                    let title = s.title;
                    if (title === 'New Chat') {
                        const firstUserMsg = messages.find(m => m.role === 'user');
                        if (firstUserMsg) {
                            title = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
                        }
                    }
                    return { ...s, messages, title, lastModified: Date.now() };
                }
                return s;
            });
        });
    },

    get: (id: string) => {
        const all = get(sessions);
        return all.find(s => s.id === id);
    }
};
