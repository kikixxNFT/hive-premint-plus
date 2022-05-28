import { INITIAL_VALUE, Settings, SETTINGS_KEY } from '@background/storage';
import { atom, useAtom, WritableAtom } from 'jotai';

const atomWithSyncedSyncStorage = <Settings>(
  key: string,
  initialValue: Settings
) => {
  const baseAtom = atom(initialValue);
  baseAtom.onMount = (setValue) => {
    chrome.runtime.sendMessage(
      {
        getSettings: true,
      },
      (response) => {
        if (response) {
          setValue({ ...response.settings, isLoading: false });
        } else {
          setValue((prev) => ({ ...prev, isLoading: false }));
        }
      }
    );
  };
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === 'function' ? update(get(baseAtom)) : update;
      if (nextValue === undefined) {
        chrome.runtime.sendMessage(
          {
            clearSettings: true,
          },
          () => set(baseAtom, nextValue)
        );
      } else {
        chrome.runtime.sendMessage(
          {
            setSettings: true,
            settings: nextValue,
          },
          (data) => {
            const { raffles, wallet, selectedWallet } = data;
            chrome.runtime.sendMessage({
              raffles,
              wallet,
              selectedWallet,
            });
            set(baseAtom, nextValue);
          }
        );
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

  chrome.runtime.onMessage.addListener(() => {
    return true;
  });

  return [syncedStorageAtom, useSyncedStorageAtom] as [
    typeof syncedStorageAtom,
    typeof useSyncedStorageAtom
  ];
};
