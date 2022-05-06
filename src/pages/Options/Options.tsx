import React from 'react';
import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  Box,
  Loader,
} from '@mantine/core';
import { useSettingsStore } from '@utils/useSettingsStore';
import { NotificationsProvider } from '@mantine/notifications';
import { Header } from '@components/Header';
import { OptionsForm } from './components/OptionsForm';
import { ConnectWallet } from './components/ConnectWallet';

const Options = () => {
  const {
    storageData: settings,
    setStorageData,
    isLoading,
  } = useSettingsStore();

  const { wallet, colorScheme } = settings;
  const toggleColorScheme = (value?: ColorScheme) => {
    setStorageData({
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
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            {isLoading ? (
              <Loader color="violet" />
            ) : !wallet ? (
              <ConnectWallet
                setStorageData={setStorageData}
                settings={settings}
              />
            ) : (
              <OptionsForm
                setStorageData={setStorageData}
                settings={settings}
              />
            )}
          </Box>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default Options;
