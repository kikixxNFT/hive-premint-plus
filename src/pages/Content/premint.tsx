import React, { useEffect } from 'react';
import { render } from 'react-dom';
import { produce } from 'immer';
import { statuses, useGetPremintStatus } from '@utils/useGetPremintStatus';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  createSyncedStorageAtom,
  RaffleData,
  useSyncedStorageAtom,
} from '@utils/createSyncedStorageAtom';

const queryClient = new QueryClient();
createSyncedStorageAtom();

function AddToWatchlist() {
  const [settings, setSettings] = useSyncedStorageAtom();
  const { wallets, selectedWallet } = settings;

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

  function GetPremintData() {
    const url = `${window.location.origin}/${
      window.location.pathname.split('/')[1]
    }`;
    const wallet = wallets?.[selectedWallet || 0]?.wallet || '';
    const status = settings?.raffles[wallet]?.[url]?.status;
    const { data, isError } = useGetPremintStatus({
      url,
      wallet,
    });
    const { autoWatchOnRegister } = settings;

    if (isError) {
      console.log(`ERROR: Could not retrieve Premint status for ${url}`);
    }

    useEffect(() => {
      if (
        data?.status &&
        settings?.raffles?.[wallet].hasOwnProperty(url) &&
        settings?.raffles?.[wallet]?.[url]?.status !== data?.status
      ) {
        const newSettings = produce(settings, (draft) => {
          draft.raffles[wallet][url] = {
            ...draft.raffles[wallet][url],
            status: data?.status,
            updated_at: Date.now(),
          };
        });
        setSettings(newSettings);
      }
    }, [data?.status, url, wallet]);

    async function handleAdd() {
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
          const [cardTitle, cardValue] = info.innerText.split('\n');
          if (cardTitle === 'Official Link') {
            draft.raffles[wallet][url].official_link = cardValue.trim();
          }
          if (cardTitle === 'Registration Closes') {
            draft.raffles[wallet][url].registration_closes = cardValue.trim();
          }
          if (cardTitle === 'Mint Date') {
            draft.raffles[wallet][url].mint_date = cardValue.trim();
          }
          if (cardTitle === 'Mint Price') {
            draft.raffles[wallet][url].mint_price = cardValue.trim();
          }
          if (cardTitle === 'Raffle Time') {
            draft.raffles[wallet][url].raffle_time = cardValue.trim();
          }
        }
        if (twitterLink) {
          draft.raffles[wallet][url].twitter_link = twitterLink;
        }
        if (discordLink) {
          draft.raffles[wallet][url].discord_link = discordLink;
        }
      });
      setSettings(newSettings);
      chrome.runtime.sendMessage({
        raffles: newSettings.raffles,
        wallet,
        selectedWallet,
      });
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
            {!status
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
      {!wallets ? (
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
      ) : (
        <GetPremintData />
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
