import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { produce } from 'immer';
import { statuses, useGetPremintStatus } from '@utils/useGetPremintStatus';
import { QueryClient, QueryClientProvider } from 'react-query';
import { INITIAL_VALUE, RaffleData, Settings } from '@background/storage';
import { Box } from '@mantine/core';

const queryClient = new QueryClient();

function AddToWatchlist() {
  const [settings, setSettings] = useState(INITIAL_VALUE);
  const { wallets } = settings;

  useEffect(() => {
    chrome.runtime.sendMessage({ getSettings: true }, (resp) => {
      console.log('loaded settings', resp.settings);
      setSettings(resp.settings);
    });
  }, []);

  chrome.runtime.onMessage.addListener((request, response, sendResponse) => {
    if (request.settingsUpdated) {
      console.log('settingsUpdated', request.settings);
      setSettings(request.settings);
    }
  });

  const statusIcons: {
    [status in RaffleData['status']]: { [key: string]: string };
  } = {
    lost: {
      icon: 'fa-thumbs-down',
      color: 'c-red',
    },
    register: {
      icon: 'fa-question',
      color: 'c-gray-light',
    },
    registered: {
      icon: 'fa-thumbs-up',
      color: 'c-green',
    },
    won: {
      icon: 'fa-trophy',
      color: 'c-yellow',
    },
    unknown: {
      icon: 'fa-plus',
      color: 'c-gray-light',
    },
  };

  function GetPremintData({ settings }: { settings: Settings }) {
    const url = `${window.location.origin}/${
      window.location.pathname.split('/')[1]
    }`;
    const { wallets, selectedWallet = 0 } = settings;
    const wallet = wallets?.[selectedWallet]?.wallet || '';
    const status = settings?.raffles[wallet]?.[url]?.status;
    const { data, isError } = useGetPremintStatus({
      url,
      wallet,
    });
    const { autoWatchOnRegister, autoOpenRegistrationLinks } = settings;

    if (isError) {
      console.log(`ERROR: Could not retrieve Premint status for ${url}`);
    }

    useEffect(() => {
      console.log('useEffect');
      if (data?.status && settings?.raffles?.[wallet].hasOwnProperty(url)) {
        const infoDivs =
          window?.document
            ?.querySelector('.container .row div:nth-child(3)')
            ?.querySelectorAll('div:not(.text-uppercase)') || [];
        let updated = false;
        const newSettings = produce(settings, (draft) => {
          if (draft.raffles[wallet][url].status !== data?.status) {
            draft.raffles[wallet][url] = {
              ...draft.raffles[wallet][url],
              status: data?.status,
              updated_at: Date.now(),
            };
            updated = true;
          }
          for (let info of Array.from(infoDivs)) {
            const [cardTitle, cardValue] = (
              info as HTMLElement
            ).innerText.split('\n');
            if (cardTitle === 'OFFICIAL LINK') {
              draft.raffles[wallet][url].official_link = cardValue.trim();
              updated = true;
            }
            if (cardTitle === 'REGISTRATION CLOSES') {
              draft.raffles[wallet][url].registration_closes = cardValue.trim();
              updated = true;
            }
            if (cardTitle === 'MINT DATE') {
              draft.raffles[wallet][url].mint_date = cardValue.trim();
              updated = true;
            }
            if (cardTitle === 'MINT PRICE') {
              draft.raffles[wallet][url].mint_price = cardValue.trim();
              updated = true;
            }
            if (cardTitle === 'RAFFLE TIME') {
              draft.raffles[wallet][url].raffle_time = cardValue.trim();
              updated = true;
            }
          }
        });
        if (updated) {
          setSettings(newSettings);
          console.log('updating...');
          console.log({ newSettings });
          //chrome.runtime.sendMessage({
          //  setSettings: true,
          //  settings: newSettings,
          //});
        }
      }
    }, [data?.status, settings, url, wallet]);

    async function handleAdd() {
      const { selectedWallet = 0 } = settings;
      const wallet = wallets?.[selectedWallet]?.wallet || '';
      const status: RaffleData['status'] =
        data?.status ||
        (window?.document
          ?.querySelector('form div.card div.card-title div.heading')
          ?.textContent?.trim()
          ?.toLowerCase() as RaffleData['status']) ||
        statuses[
          window?.document?.querySelector('.card .card-body div:nth-child(2)')
            ?.textContent || 'unknown'
        ];

      const infoDivs =
        window?.document
          ?.querySelector('.container .row div:nth-child(3)')
          ?.querySelectorAll('div:not(.text-uppercase)') || [];
      const twitterLink =
        window?.document
          ?.querySelector('.fa-twitter')
          ?.parentElement?.querySelector('a')?.href || '';
      const discordLink =
        window?.document
          ?.querySelector('.fa-discord')
          ?.parentElement?.querySelector('a')?.href || '';

      const newSettings = produce(settings, (draft) => {
        draft.raffles[wallet][url] = {
          name:
            window?.document
              ?.querySelector('.container .row div:nth-child(1) h1')
              ?.textContent?.trim() || url,
          status,
          updated_at: Date.now(),
          created_at: Date.now(),
        };

        for (let info of Array.from(infoDivs)) {
          const [cardTitle, cardValue] = (info as HTMLElement).innerText.split(
            '\n'
          );
          if (cardTitle === 'OFFICIAL LINK') {
            draft.raffles[wallet][url].official_link = cardValue.trim();
          }
          if (cardTitle === 'REGISTRATION CLOSES') {
            draft.raffles[wallet][url].registration_closes = cardValue.trim();
          }
          if (cardTitle === 'MINT DATE') {
            draft.raffles[wallet][url].mint_date = cardValue.trim();
          }
          if (cardTitle === 'MINT PRICE') {
            draft.raffles[wallet][url].mint_price = cardValue.trim();
          }
          if (cardTitle === 'RAFFLE TIME') {
            draft.raffles[wallet][url].raffle_time = cardValue.trim();
          }
        }
        if (twitterLink) {
          draft.raffles[wallet][url].twitter_link = twitterLink;
        }
        if (discordLink) {
          draft.raffles[wallet][url].discord_link = discordLink;
        }
        if (
          autoOpenRegistrationLinks &&
          !draft.raffles[wallet][url].auto_registered
        ) {
          const twitterScreenName = twitterLink.replace(
            'https://twitter.com/',
            ''
          );
          chrome.runtime.sendMessage({
            autoRegister: true,
            twitterScreenName,
            discordLink,
          });
          draft.raffles[wallet][url].auto_registered = true;
        }
      });
      chrome.runtime.sendMessage({ setSettings: true, settings: newSettings });
    }

    if (autoWatchOnRegister) {
      const registerButton = window?.document?.querySelector(
        'button[name="registration-form-submit"]'
      );
      registerButton?.addEventListener('mousedown', handleAdd);
    }

    return (
      <Box className="text-uppercase text-sm text-muted">
        {'Add to Watchlist'}
        <br />
        <span>
          <i
            className={`fas ${statusIcons[status || 'unknown'].icon} ${
              statusIcons[status || 'unknown'].color
            } mr-2`}
          ></i>
          <button
            onClick={handleAdd}
            disabled={!!status}
            className={`text-md p-0 bg-transparent ${
              status ? 'c-gray-light' : 'c-base-1'
            } border-0 strong-500`}
          >
            {!status
              ? 'start watching'
              : status === 'register'
              ? 'unregistered'
              : status}
          </button>
        </span>
      </Box>
    );
  }

  return (
    <>
      {!wallets ? (
        <Box className="text-uppercase text-sm text-muted">
          {'Add to Watchlist'}
          <br />
          <span>
            <i className={`fas fa-exclamation-triangle mr-2`}></i>
            <button
              disabled
              className={`text-md p-0 bg-transparent c-gray-light border-0 strong-500`}
            >
              {'Not Configured!'}
            </button>
          </span>
        </Box>
      ) : (
        <GetPremintData settings={settings} />
      )}
    </>
  );
}

const container = window.document.querySelector(
  '.container .row div:nth-child(3)'
);
const app = document.createElement('div');
app.className = 'col-6 col-lg-4 mb-4';
app.textContent = 'Add to Watchlist';
container?.appendChild(app);
render(
  <QueryClientProvider client={queryClient}>
    <AddToWatchlist />
  </QueryClientProvider>,
  app
);
