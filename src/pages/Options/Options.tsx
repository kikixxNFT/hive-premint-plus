import React from 'react';
import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  Box,
  Loader,
} from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { Header } from '@components/Header';
import { OptionsForm } from './components/OptionsForm';
import { ConnectWallet } from './components/ConnectWallet';
import { OptionsRaffles } from './components/OptionsRaffles';
import { useSyncedStorageAtom } from '@utils/createSyncedStorageAtom';

const Options = () => {
  const [settings, setSettings] = useSyncedStorageAtom();
  const { wallet, colorScheme, isLoading } = settings;
  const toggleColorScheme = (value?: ColorScheme) => {
    setSettings({
      ...settings,
      colorScheme: value || colorScheme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: 'lg', fontFamily: 'Inter' }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NotificationsProvider>
          <Header withLegend={false} withSettings={false} />
          <Box
            sx={{
              paddingBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: 'calc(100vh - 56px)',
              gridColumn: '1 / 3',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <Loader color="violet" />
            ) : !wallet ? (
              <ConnectWallet />
            ) : (
              <>
                <OptionsForm />
                <OptionsRaffles />
              </>
            )}
          </Box>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default Options;
