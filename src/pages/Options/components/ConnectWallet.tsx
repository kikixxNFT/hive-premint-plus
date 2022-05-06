import React, { useState } from 'react';
import { Settings } from '@utils/useSettingsStore';
import { Anchor, Box, Button, Text } from '@mantine/core';
import createMetaMaskProvider from 'metamask-extension-provider';

export function ConnectWallet({
  setStorageData,
  settings,
}: {
  setStorageData: (data: Settings) => void;
  settings: Settings;
}) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nonce = Math.floor(Math.random() * 10000000);

  async function connect() {
    setError('');
    setLoading(true);
    const provider = createMetaMaskProvider();
    const [accounts] = await Promise.all([
      provider.request<string[]>({
        method: 'eth_requestAccounts',
      }),
    ]);
    const account = accounts?.[0] ? accounts[0].toString().toLowerCase() : null;
    const msg = `0x${Buffer.from(nonce.toString(), 'utf8').toString('hex')}`;
    if (account) {
      try {
        const signature = await provider.request({
          method: 'personal_sign',
          params: [msg, account],
        });
        console.log({ signature, msg, account });
        chrome.runtime.sendMessage(
          { verifyAddress: true, nonce, account, signature },
          (res) => {
            if (res.authenticated) {
              setLoggedIn(res.authenticated);
              setStorageData({ ...settings, wallet: account });
            } else {
              setError(
                'Error confirming wallet. Please make sure you hold a Hive Alpha or Hive Founders pass.'
              );
            }
            setLoading(false);
          }
        );
      } catch (e) {
        // user denied request most likely
        setLoading(false);
      }
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!loggedIn && (
        <>
          <Text>
            In order to verify your wallet, you need to sign a message to
            confirm your wallet holds a Hive Alpha or Hive Founders pass.
          </Text>
          <Text>
            Signing a message does not generate a transaction and so is free!
          </Text>
          <Button
            disabled={loading}
            sx={{ marginTop: '10px' }}
            onClick={connect}
          >
            {loading ? 'Loading...' : 'Verify Wallet'}
          </Button>
          {error && (
            <Text sx={{ color: 'red', marginTop: '20px' }}>
              {'Error confirming wallet. Please make sure you hold a '}
              <Anchor
                sx={{ color: 'white' }}
                href="https://opensea.io/collection/hive-alpha"
                target="_blank"
                rel="noreferrer"
              >
                Hive Alpha or Hive Founders
              </Anchor>
              {' pass.'}
            </Text>
          )}
        </>
      )}
    </Box>
  );
}
