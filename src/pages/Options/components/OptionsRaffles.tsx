import React, { useState } from 'react';
import { Box, useMantineTheme, Tabs, Text } from '@mantine/core';
import { RaffleTable } from './RaffleTable';
import { Settings, useSyncedStorageAtom } from '@utils/createSyncedStorageAtom';

export function OptionsRaffles() {
  const [settings, setSettings] = useSyncedStorageAtom();
  const {
    wallets,
    colorScheme,
    selectedWallet: previousSelectedWallet = 0,
  } = settings;
  const theme = useMantineTheme();
  const [selectedWallet, setSelectedWallet] = useState(previousSelectedWallet);

  function handleTabChange(active: number, tabKey: string) {
    setSelectedWallet(active);
    setSettings((settings: Settings) => ({
      ...settings,
      selectedWallet: active,
    }));
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '32px',
        border: `1px solid ${
          colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.dark[7]
        }`,
        borderRadius: '6px',
        height: '100%',
        flexGrow: 1,
        overflow: 'auto',
      }}
    >
      {wallets ? (
        <>
          <Tabs onTabChange={handleTabChange} color="grape">
            {wallets?.map(({ wallet }, idx) => {
              const key = `Wallet ${idx + 1}`;
              return (
                <Tabs.Tab key={key} tabKey={wallet} label={key}>
                  <Text sx={{ fontFamily: 'monospace' }}>{wallet}</Text>
                </Tabs.Tab>
              );
            })}
          </Tabs>
          <RaffleTable selectedWallet={selectedWallet} />
        </>
      ) : (
        <Box
          sx={{
            display: 'grid',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>Please complete configuration first, and then hit "Save"</Text>
        </Box>
      )}
    </Box>
  );
}
