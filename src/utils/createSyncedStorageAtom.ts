import { atom, useAtom, WritableAtom } from 'jotai';
import { ColorScheme } from '@mantine/core';
import localForage from 'localforage';

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
export const DB_CONFIG = {
  driver: localForage.INDEXEDDB,
  name: 'hive-premint-plus',
  version: 1.0,
  storeName: SETTINGS_KEY,
};

localForage.config(DB_CONFIG);

const atomWithSyncedSyncStorage = <Settings>(
  key: string,
  initialValue: Settings
) => {
  const baseAtom = atom(initialValue);
  baseAtom.onMount = (setValue) => {
    localForage.getItem(key, (items) => {
      if (items) {
        setValue({ ...items, isLoading: false });
      } else {
        setValue((prev) => ({ ...prev, isLoading: false }));
      }
    });
  };
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === 'function' ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      if (nextValue === undefined) {
        localForage.clear();
      } else {
        localForage.setItem(key, nextValue);
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
