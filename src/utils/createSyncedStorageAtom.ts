import { atom, useAtom, WritableAtom } from 'jotai';
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

const atomWithSyncedSyncStorage = <Settings>(
  key: string,
  initialValue: Settings
) => {
  const baseAtom = atom(initialValue);
  baseAtom.onMount = (setValue) => {
    function storageUpdateListener(changes: {
      [key: string]: chrome.storage.StorageChange;
    }) {
      for (let [changedKey, { newValue }] of Object.entries(changes)) {
        if (changedKey === key) {
          setValue(newValue ?? undefined);
        }
      }
    }
    chrome.storage.onChanged.addListener(storageUpdateListener);
    chrome.storage.sync.get([key], (items) => {
      if (items[key]) {
        setValue({ ...items[key], isLoading: false });
      } else {
        setValue((prev) => ({ ...prev, isLoading: false }));
      }
    });

    return () => chrome.storage.onChanged.removeListener(storageUpdateListener);
  };
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === 'function' ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      if (nextValue === undefined) {
        chrome.storage.sync.clear();
      } else {
        chrome.storage.sync.set({ [key]: nextValue }, () => {});
      }
    }
  );
  return derivedAtom;
};

export let syncedStorageAtom: WritableAtom<Settings, unknown, void>;
export let useSyncedStorageAtom: () => [Settings, (update?: unknown) => void];

export const createSyncedStorageAtom = () => {
  if (!syncedStorageAtom) {
    syncedStorageAtom = atomWithSyncedSyncStorage<Settings>(
      SETTINGS_KEY,
      INITIAL_VALUE
    );
  }
  useSyncedStorageAtom = () => useAtom(syncedStorageAtom);

  return [syncedStorageAtom, useSyncedStorageAtom] as [
    typeof syncedStorageAtom,
    typeof useSyncedStorageAtom
  ];
};
