import { localStore } from './localStore';

export type Voice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede' | 'Erinome';

export interface Settings {
    voice: Voice;
}

const defaultSettings: Settings = {
    voice: 'Erinome'
};

export const settings = localStore<Settings>('app-settings', defaultSettings);
