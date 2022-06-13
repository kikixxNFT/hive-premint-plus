import React, { useState } from 'react';
import { Anchor, Box, Button, Text, TextInput, ThemeIcon } from '@mantine/core';
import { nanoid } from 'nanoid';
import { CircleCheck, Copy } from 'tabler-icons-react';
import { copyToClipboard } from '@utils/copyToClipboard';
import { showNotification } from '@mantine/notifications';
import { useSyncedStorageAtom } from '@utils/createSyncedStorageAtom';

export function ConnectWallet() {
  const [settings, setSettings] = useSyncedStorageAtom();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [confirmationCode] = useState(`HiveAlpha-${nanoid(10)}`);

  async function verifyWallet() {
    setError(false);
    setLoading(true);
    try {
      const res = await fetch(`https://opensea.io/${walletAddress}`);
      const body = await res.text();
      if (!body.includes(confirmationCode)) {
        setError(true);
        setLoading(false);
      } else {
        chrome.runtime.sendMessage({ verifyAddress: walletAddress }, (res) => {
          if (res.authenticated) {
            setLoggedIn(res.authenticated);
            setSettings({ ...settings, wallet: walletAddress });
            showNotification({
              id: 'saved-data',
              title: 'Success!',
              message: 'Wallet has been verified',
              color: 'teal',
              icon: (
                <ThemeIcon variant="outline" color="gray" radius="xl">
                  <CircleCheck size={48} strokeWidth={2} />
                </ThemeIcon>
              ),
              autoClose: 2000,
            });
          } else {
            setError(true);
          }
          setLoading(false);
        });
      }
    } catch (e) {
      // fetch failed
      setError(true);
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setWalletAddress(e.target.value);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '10px',
      }}
    >
      {!loggedIn && (
        <>
          <TextInput
            required
            label="Pass Wallet"
            radius="md"
            value={walletAddress}
            placeholder="0x..."
            onChange={handleChange}
          />
          <Text>
            {
              'In order to verify your wallet, you need to temporarily update the "Bio" field on '
            }
            <Anchor href="https://opensea.io/account/settings" target="_blank">
              {'OpenSea'}
            </Anchor>
            {' with the following unique code:'}
          </Text>
          <TextInput
            disabled
            label=""
            radius="md"
            sx={{ width: '225px' }}
            value={confirmationCode}
            rightSection={
              <ThemeIcon
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                  },
                }}
                variant="outline"
                onClick={() => copyToClipboard({ value: confirmationCode })}
              >
                <Copy size={16} />
              </ThemeIcon>
            }
          />
          <Text>
            When done, click <strong>Verify Wallet</strong> so that we can
            confirm your wallet holds a compatible Premint+ pass.
          </Text>
          <Button
            color="grape"
            disabled={loading}
            sx={{ marginTop: '10px' }}
            onClick={verifyWallet}
          >
            {loading ? 'Loading...' : 'Verify Wallet'}
          </Button>
          {error && (
            <Text sx={{ color: 'red', marginTop: '20px' }}>
              {
                'Error confirming wallet. Please make sure you entered the correct code and hold a '
              }
              <Anchor
                sx={{ color: 'white' }}
                href="https://opensea.io/collection/hive-alpha"
                target="_blank"
                rel="noreferrer"
              >
                Hive Alpha, Hive Founders
              </Anchor>
              {' or '}
              <Anchor
                sx={{ color: 'white' }}
                href="https://opensea.io/collection/hive-alpha"
                target="_blank"
                rel="noreferrer"
              >
                Premint+
              </Anchor>
              {' pass.'}
            </Text>
          )}
        </>
      )}
    </Box>
  );
}
