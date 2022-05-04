import { SETTINGS_KEY } from '@utils/useSettingsStore';
import { statuses, UNREGISTERED } from '@utils/useGetPremintStatus';
import { produce } from 'immer';
import { RateLimit } from 'async-sema';
import { setBadgeText } from '@utils/setBadgeText';
import { ethers, BigNumber } from 'ethers';
import { abi, contractAddress, rpc } from '@assets/hive-alpha';

const limit = RateLimit(2);
const provider = new ethers.providers.JsonRpcProvider(rpc);
const contractInstance = new ethers.Contract(contractAddress, abi, provider);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.raffles) {
    setBadgeText({ raffles: request.raffles });
  }
  sendResponse({ updated: true });
});

chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: '/options.html',
    });
  }
});

chrome.storage.sync.get(SETTINGS_KEY, (data) => {
  chrome.alarms.create('poll-premint', { periodInMinutes: 30 });
});

chrome.alarms.onAlarm.addListener(() => {
  chrome.storage.sync.get(SETTINGS_KEY, async (data) => {
    const { raffles, wallet, interval, autoDeleteLost } = data?.[SETTINGS_KEY];
    if (!wallet) return;

    const foundersPasses = await contractInstance.balanceOf(wallet, 1);
    const alphaPasses = await contractInstance.balanceOf(wallet, 2);
    /*if (!foundersPasses.add(alphaPasses).gt(BigNumber.from(0))) {
        const newSettings = produce(data?.[SETTINGS_KEY], (draft) => {
          delete draft.wallet
        })
        chrome.storage.sync.set({ [SETTINGS_KEY]: newSettings })
      } else {*/
    const updatedRaffles = Object.entries(raffles).filter(
      ([, data]) => Date.now() - data?.updated_at >= interval * 60 * 1000
    );
    if (updatedRaffles.length > 0) {
      updatedRaffles.map(async ([url]) => {
        await limit();
        const res = await fetch(`${url}/verify/?wallet=${wallet}`, {
          method: 'GET',
          mode: 'cors',
        });
        const txt = await res.text();
        let matchedStatus = 'unknown';
        const newSettings = produce(data?.[SETTINGS_KEY], (draft) => {
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
          draft.raffles[url].status = matchedStatus;
          draft.raffles[url].updated_at = Date.now();

          if (autoDeleteLost && matchedStatus === 'lost') {
            delete draft.raffles[url];
          }
        });
        console.log(`${Date.now()}: ${url}`, newSettings);
        chrome.storage.sync.set({ [SETTINGS_KEY]: newSettings });
      });
    }
    //}
  });

  chrome.storage.sync.get(SETTINGS_KEY, (data) => {
    const { raffles } = data?.[SETTINGS_KEY];
    setBadgeText({ raffles });
  });
});
