import { statuses, UNREGISTERED } from '@utils/useGetPremintStatus';
import { produce, createDraft, finishDraft } from 'immer';
import { RateLimit } from 'async-sema';
import { setBadgeText } from '@utils/setBadgeText';
import { ethers, BigNumber } from 'ethers';
import { abi, contractAddress, rpc } from '@assets/hive-alpha';
import { clearStorage, getStorage, setStorage } from './storage';

const limit = RateLimit(2);
const provider = new ethers.providers.JsonRpcProvider(rpc);
const contractInstance = new ethers.Contract(contractAddress, abi, provider);
let registering = false;

async function hasPasses({ address }) {
  const foundersPasses = await contractInstance.balanceOf(address, 1);
  const alphaPasses = await contractInstance.balanceOf(address, 2);
  return foundersPasses.add(alphaPasses).gt(BigNumber.from(0));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.raffles) {
    setBadgeText({
      raffles: request.raffles,
      wallet: request.wallet,
      selectedWallet: request.selectedWallet,
    });
    sendResponse();
  } else if (request.verifyAddress) {
    hasPasses({ address: request.verifyAddress }).then((walletHasPasses) =>
      sendResponse({ authenticated: walletHasPasses })
    );
    return true;
  } else if (request.autoRegister) {
    if (!registering) {
      const url = `https://twitter.com/intent/follow?screen_name=${request.twitterScreenName}`;
      async function openTab() {
        registering = true;
        if (request.discordLink) {
          chrome.tabs.create({
            url: request.discordLink,
            active: true,
          });
        }

        if (request.twitterScreenName) {
          const tab = await chrome.tabs.create({
            url,
            active: false,
          });
          chrome.tabs.onUpdated.addListener(async function (tabId, info) {
            if (tabId === tab.id && info.url) {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                  return new Promise((resolve) => {
                    const observer = new MutationObserver(function (
                      mutations,
                      mutationInstance
                    ) {
                      const follow = document?.querySelector(
                        '[data-testid="confirmationSheetConfirm"]'
                      );
                      if (follow) {
                        follow?.click();
                        mutationInstance.disconnect();
                        resolve();
                      }
                    });

                    observer.observe(document, {
                      childList: true,
                      subtree: true,
                    });
                  });
                },
              });
              chrome.tabs.remove(tab.id);
              registering = false;
            }
          });
        }
      }
      openTab();
    }
    sendResponse();
  } else if (request.getSettings) {
    getStorage().then((settings) => sendResponse({ settings }));
    return true;
  } else if (request.setSettings) {
    setStorage({ settings: request.settings });
    sendResponse();
  } else if (request.clearSettings) {
    clearStorage();
    sendResponse();
  } else {
    sendResponse();
  }
});

chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: '/options.html',
    });
  }
});

chrome.alarms.create('poll-premint', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(() => {
  getStorage().then((settings) => {
    const { raffles, wallet, interval, autoDeleteLost } = settings;
    if (!wallet) return;

    if (!hasPasses({ address: wallet })) {
      const newSettings = produce(settings, (draft) => {
        delete draft.wallet;
      });
      setStorage({ settings: newSettings });
    } else {
      Object.entries(raffles).forEach(async ([raffleWallet, raffle]) => {
        const updatedRaffles = Object.entries(raffle).filter(
          ([, data]) => Date.now() - data?.updated_at >= interval * 60 * 1000
        );
        if (updatedRaffles.length > 0) {
          const premintStatuses = updatedRaffles.map(async ([url]) => {
            await limit();
            const res = await fetch(`${url}/verify/?wallet=${raffleWallet}`, {
              method: 'GET',
              mode: 'cors',
            });
            const txt = await res.text();
            return { url, txt };
          });
          try {
            const results = await Promise.all(premintStatuses);
            const draft = createDraft(settings);
            for (let { url, txt } of results) {
              let matchedStatus = 'unknown';
              if (txt.includes(UNREGISTERED.wording)) {
                matchedStatus = UNREGISTERED.status;
              } else {
                for (let [key, status] of Object.entries(statuses)) {
                  if (txt.includes(key)) {
                    matchedStatus = status;
                    break;
                  }
                }
              }
              draft.raffles[raffleWallet][url].status = matchedStatus;
              draft.raffles[raffleWallet][url].updated_at = Date.now();

              if (autoDeleteLost && matchedStatus === 'lost') {
                delete draft.raffles[raffleWallet][url];
              }
            }

            const newSettings = finishDraft(draft);
            setStorage({ settings: newSettings });
          } catch (err) {
            // failed to fetch, probably during sleep or network issue, fail silently
          }
        }
      });
    }
  });
});
