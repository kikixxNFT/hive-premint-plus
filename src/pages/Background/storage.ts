import localForage from 'localforage';
import { ColorScheme } from '@mantine/core';

export type RaffleData = {
  name: string;
  status: 'lost' | 'register' | 'registered' | 'won' | 'unknown';
  updated_at: number;
  created_at: number;
  official_link?: string;
  registration_closes?: string;
  mint_date?: string;
  mint_price?: string;
  raffle_time?: string;
  twitter_link?: string;
  discord_link?: string;
  auto_registered?: boolean;
};
export type Settings = {
  colorScheme: ColorScheme;
  interval: number;
  wallet?: string;
  wallets?: {
    wallet: string;
  }[];
  autoDeleteLost?: boolean;
  autoWatchOnRegister?: boolean;
  autoOpenRegistrationLinks?: boolean;
  raffles: {
    [wallet: string]: {
      [url: string]: RaffleData;
    };
  };
  isLoading: boolean;
  selectedWallet?: number;
};

export const SETTINGS_KEY = 'premint-plus';
export const INITIAL_VALUE: Settings = {
  colorScheme: 'dark',
  interval: 60, // 720 = 12 hours
  wallet: '',
  autoDeleteLost: false,
  autoWatchOnRegister: false,
  autoOpenRegistrationLinks: false,
  raffles: {},
  isLoading: true,
};

const DB_CONFIG = {
  driver: localForage.INDEXEDDB,
  name: 'hive-premint-plus',
  version: 1.0,
  storeName: SETTINGS_KEY,
};

localForage.config(DB_CONFIG);

export function setStorage({ settings }: { settings: Settings }) {
  localForage.setItem(SETTINGS_KEY, settings, (err, data) => {
    chrome.tabs.query({ url: '*://*.premint.xyz/*' }, function (tabs) {
      tabs.forEach(function (tab) {
        if (tab && tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            settingsUpdated: true,
            settings: data,
          });
        }
      });
    });
    chrome.runtime.sendMessage({
      settingsUpdated: true,
      settings: data,
    });
  });
}

export function getStorage() {
  return localForage.getItem(SETTINGS_KEY);
}

export function clearStorage() {
  return localForage.clear();
}