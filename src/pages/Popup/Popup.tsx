import React, { useEffect, useState } from 'react';
import {
  Box,
  Loader,
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  Tabs,
} from '@mantine/core';
import { Link } from '@components/Link';
import { Header } from '@components/Header';
import { Error, RaffleList } from './components';
import { Settings, useSyncedStorageAtom } from '@utils/createSyncedStorageAtom';
import { useQueries } from 'react-query';
import { fetchStatus } from '@utils/useGetPremintStatus';
import { setBadgeText } from '@utils/setBadgeText';

const Popup = () => {
  const [settings, setSettings] = useSyncedStorageAtom();
  const {
    selectedWallet: previousSelectedWallet = 0,
    wallets,
    interval,
    raffles,
    colorScheme,
    isLoading,
  } = settings;
  const [selectedWallet, setSelectedWallet] = useState(previousSelectedWallet);
  const wallet = wallets?.[selectedWallet]?.wallet || '';

  useEffect(() => {
    if (!isLoading) {
      setSelectedWallet(previousSelectedWallet || 0);
      if (wallets) {
        setBadgeText({
          raffles,
          selectedWallet,
          wallet,
        });
      }
    }
  }, [
    isLoading,
    previousSelectedWallet,
    raffles,
    selectedWallet,
    wallet,
    wallets,
  ]);

  function handleTabChange(active: number, tabKey: string) {
    setSelectedWallet(active);
    setSettings((settings: Settings) => ({
      ...settings,
      selectedWallet: active,
    }));
  }

  const premintQueries = useQueries(
    raffles?.[wallet]
      ? Object.entries(raffles[wallet])
          .filter(
            ([, data]) => Date.now() - data?.updated_at >= interval * 60 * 1000
          )
          .map(([url]) => ({
            queryKey: [`${url}/verify/`, wallet],
            queryFn: () => fetchStatus({ url, wallet }),
          }))
      : []
  );

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
        <Header />
        {isLoading ? (
          <Box
            sx={{
              display: 'grid',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
            }}
          >
            <Loader mt="56px" color="violet" />
          </Box>
        ) : !wallet ? (
          <Error
            message={
              <>
                {'Missing wallet! Please '}
                <Link href="/options.html">{'configure me'}</Link>
                {' first.'}
              </>
            }
          />
        ) : (
          <Box
            px="xs"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              flexGrow: 1,
              overflow: 'auto',
            }}
          >
            <Tabs
              active={selectedWallet}
              onTabChange={handleTabChange}
              color="grape"
            >
              {wallets?.map(({ wallet }, idx) => {
                const key = `Wallet ${idx + 1}`;
                return (
                  <Tabs.Tab key={key} tabKey={wallet} label={key}></Tabs.Tab>
                );
              })}
            </Tabs>
            {!raffles?.[wallet] || !Object.keys(raffles[wallet]).length ? (
              <Error message="You're raffle-less fren! Time to start the grind." />
            ) : (
              <RaffleList
                premintQueries={premintQueries}
                selectedWallet={selectedWallet}
              />
            )}
          </Box>
        )}
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default Popup;
