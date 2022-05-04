import React from 'react';
import { Loader, MantineProvider, ColorSchemeProvider, ColorScheme, useMantineTheme } from '@mantine/core';
import { useSettingsStore} from '@utils/useSettingsStore';
import { Link } from '@components/Link'
import { Header } from '@components/Header'
import { Error, RaffleList } from './components'

const Popup = () => {
  const { storageData: settings, setStorageData, isLoading } = useSettingsStore();
  const { wallet, raffles, colorScheme } = settings

  const toggleColorScheme = (value?: ColorScheme) => {
    setStorageData({
      ...settings,
      colorScheme: value || colorScheme === 'dark' ? 'light' : 'dark',
    });
  }

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme, defaultRadius: 'lg', fontFamily: 'Inter' }} withGlobalStyles withNormalizeCSS>
        <Header />
        {isLoading && <Loader color="violet" />}
        {!isLoading && !wallet && <Error message={<>
          {'Missing wallet! Please '}<Link href='/options.html'>{'configure me'}</Link>{' first.'}
        </>} />}
        {!isLoading && wallet && !Object.keys(raffles).length && <Error message="You're raffle-less fren! Time to start the grind." />}
        {!isLoading && wallet && !!Object.keys(raffles).length && <RaffleList wallet={wallet} />}
      </MantineProvider >
    </ColorSchemeProvider >
  );
};

export default Popup;
