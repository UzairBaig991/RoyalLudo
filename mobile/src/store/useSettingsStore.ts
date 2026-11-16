import { create } from 'zustand';

interface SettingsState {
  soundEffects: boolean;
  gameMusic: boolean;
  hapticFeedback: boolean;
  allowVoiceChat: boolean;
  language: string;
  notifications: boolean;
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  personalizedOffers: boolean;
  toggleSetting: (key: keyof SettingsState) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  soundEffects: true,
  gameMusic: false,
  hapticFeedback: true,
  allowVoiceChat: false,
  language: 'English',
  notifications: true,
  showOnlineStatus: true,
  allowFriendRequests: true,
  personalizedOffers: false,
  toggleSetting: (key) =>
    set((state) => ({
      [key]: !state[key],
    })),
}));
