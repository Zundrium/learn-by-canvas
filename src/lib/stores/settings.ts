import { localStore } from './localStore';

export type Voice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede' | 'Erinome';

export interface Settings {
    voice: Voice;
    apiKey: string;
}

const defaultSettings: Settings = {
    voice: 'Erinome',
    apiKey: ''
};

export const settings = localStore<Settings>('app-settings', defaultSettings);
