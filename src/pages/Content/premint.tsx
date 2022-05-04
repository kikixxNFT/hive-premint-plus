import React, { useEffect } from 'react';
import { render } from 'react-dom';
import { produce } from 'immer';
import {
  useSettingsStore,
  Settings,
  RaffleData,
} from '@utils/useSettingsStore';
import { statuses, useGetPremintStatus } from '@utils/useGetPremintStatus';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function AddToWatchlist() {
  const {
    storageData: settings,
    setStorageData,
    isLoading,
  } = useSettingsStore();
  const { wallet } = settings;

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

  function GetPremintData({
    wallet,
    settings,
  }: {
    wallet: string;
    settings: Settings;
  }) {
    const url = `${window.location.origin}/${
      window.location.pathname.split('/')[1]
    }`;
    const { data, isError } = useGetPremintStatus({ url, wallet });
    const { autoWatchOnRegister } = settings;
    const status = settings?.raffles[url]?.status;

    if (isError) {
      console.log(`ERROR: Could not retrieve Premint status for ${url}`);
    }

    useEffect(() => {
      if (
        settings?.raffles.hasOwnProperty(url) &&
        data?.status &&
        settings?.raffles[url]?.status !== data?.status
      ) {
        const newSettings = produce(settings, (draft) => {
          draft.raffles[url] = {
            ...draft.raffles[url],
            status: data?.status,
            updated_at: Date.now(),
          };
        });
        setStorageData(newSettings);
      }
    }, [data?.status, settings, url]);

    function handleAdd() {
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
          ?.querySelector('.container .row div:nth-child(2) div')
          ?.querySelectorAll('div') || [];
      const twitterLink =
        window?.document
          ?.querySelector('.fa-twitter')
          ?.parentElement?.querySelector('a')?.href || '';
      const discordLink =
        window?.document
          ?.querySelector('.fa-discord')
          ?.parentElement?.querySelector('a')?.href || '';

      const newSettings = produce(settings, (draft) => {
        draft.raffles[url] = {
          name:
            window?.document
              ?.querySelector('.container .row div:nth-child(1) h1')
              ?.textContent?.trim() || url,
          status,
          updated_at: Date.now(),
        };

        for (let info of Array.from(infoDivs)) {
          const [cardTitle, cardValue] = info.innerText.split('\n');
          if (cardTitle === 'Official Link') {
            draft.raffles[url].official_link = cardValue.trim();
          }
          if (cardTitle === 'Registration Closes') {
            draft.raffles[url].registration_closes = cardValue.trim();
          }
          if (cardTitle === 'Mint Date') {
            draft.raffles[url].mint_date = cardValue.trim();
          }
          if (cardTitle === 'Mint Price') {
            draft.raffles[url].mint_price = cardValue.trim();
          }
          if (cardTitle === 'Raffle Time') {
            draft.raffles[url].raffle_time = cardValue.trim();
          }
        }
        if (twitterLink) {
          draft.raffles[url].twitter_link = twitterLink;
        }
        if (discordLink) {
          draft.raffles[url].discord_link = discordLink;
        }
      });
      setStorageData(newSettings);
      chrome.runtime.sendMessage({ raffles: newSettings.raffles });
    }

    if (autoWatchOnRegister) {
      const registerButton = window?.document?.querySelector(
        'button[name="registration-form-submit"]'
      );
      registerButton?.addEventListener('mousedown', handleAdd);
    }

    return (
      <>
        {'Add to Watchlist'}
        <br />
        <span className="badge badge-lg text-md z-depth-2-top">
          <i
            className={`fas ${statusIcons[status || 'unknown'].icon} ${
              statusIcons[status || 'unknown'].color
            } mr-2`}
          ></i>
          <button
            onClick={handleAdd}
            disabled={!!status}
            className={`p-0 bg-transparent ${
              status ? 'c-gray-light' : 'c-base-1'
            } border-0 strong-500`}
          >
            {isLoading
              ? 'Loading...'
              : !status
              ? 'start watching'
              : status === 'register'
              ? 'unregistered'
              : status}
          </button>
        </span>
      </>
    );
  }

  return (
    <>
      {!wallet && (
        <>
          {'Add to Watchlist'}
          <br />
          <span className="badge badge-lg text-md z-depth-2-top">
            <i className={`fas fa-exclamation-triangle mr-2`}></i>
            <button
              disabled
              className={`p-0 bg-transparent c-gray-light border-0 strong-500`}
            >
              {'Not Configured!'}
            </button>
          </span>
        </>
      )}
      {wallet && settings && (
        <GetPremintData wallet={wallet} settings={settings} />
      )}
    </>
  );
}

const container = window.document.querySelector(
  '.container .row div:nth-child(2) div'
);
const app = document.createElement('div');
app.className = 'c-gray-light text-md strong-500 d-inline-block mr-3 mb-4';
app.textContent = 'Add to Watchlist';
container?.appendChild(app);
render(
  <QueryClientProvider client={queryClient}>
    <AddToWatchlist />
  </QueryClientProvider>,
  app
);
