// common/useSettingsStore.js
import { ColorScheme } from '@mantine/core';
import { useEffect, useState } from 'react';

export type RaffleData = {
  name: string;
  status: 'lost' | 'register' | 'registered' | 'won' | 'unknown';
  updated_at: number;
  official_link?: string;
  registration_closes?: string;
  mint_date?: string;
  mint_price?: string;
  raffle_time?: string;
  twitter_link?: string;
  discord_link?: string;
};
export type Settings = {
  colorScheme: ColorScheme;
  interval: number;
  loaded?: boolean;
  wallet?: string;
  autoDeleteLost?: boolean;
  autoWatchOnRegister?: boolean;
  raffles: {
    [key: string]: RaffleData;
  };
};

export const SETTINGS_KEY = 'premint-plus';
export const INITIAL_VALUE: Settings = {
  colorScheme: 'dark',
  interval: 60, // 720 = 12 hours
  wallet: '',
  autoDeleteLost: false,
  autoWatchOnRegister: false,
  raffles: {},
};

export function getData() {
  return new Promise<Settings>((resolve, reject) => {
    chrome.storage.sync.get(SETTINGS_KEY, (items) => {
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(items[SETTINGS_KEY] || INITIAL_VALUE);
    });
  });
}

export function setData(data: Settings) {
  return new Promise<void>((resolve, reject) =>
    chrome.storage.sync.set({ [SETTINGS_KEY]: data }, () =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve()
    )
  );
}

export const useSettingsStore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(INITIAL_VALUE)

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const data = await getData();
      setIsLoading(false);
      setSettings(data)
    }
    fetchSettings();
  }, []);

  async function setStorageData(data: Settings) {
    await setData(data);
    setSettings(data);
  }

  return { storageData: settings, setStorageData, isLoading };
};
