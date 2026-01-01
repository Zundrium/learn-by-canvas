import { localStore } from './localStore';

export type Theme = 'dark' | 'light' | 'system';
export type Voice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede' | 'Erinome';

export interface Settings {
    theme: Theme;
    voice: Voice;
}

const defaultSettings: Settings = {
    theme: 'system',
    voice: 'Erinome'
};

export const settings = localStore<Settings>('app-settings', defaultSettings);
