import { Settings } from '@background/storage';

export const setBadgeText = ({
  raffles,
  selectedWallet,
  wallet,
}: {
  raffles: Settings['raffles'];
  selectedWallet: number;
  wallet: string;
}) => {
  const won =
    raffles?.[wallet] &&
    Object.entries(raffles[wallet]).filter(
      ([, raffle]) => raffle.status === 'won'
    );
  chrome.action.setBadgeBackgroundColor({
    color: won?.length ? '#AF8700' : '#707070',
  });
  chrome.action.setBadgeText({ text: `#${String(selectedWallet + 1)}` });
};
