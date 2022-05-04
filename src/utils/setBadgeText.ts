import { Settings } from '@utils/useSettingsStore';

export const setBadgeText = ({ raffles }: { raffles: Settings['raffles'] }) => {
    const won = Object.entries(raffles).filter(([, raffle]) => raffle.status === 'won')
    chrome.action.setBadgeBackgroundColor({ color: '#F03E3E' })
    chrome.action.setBadgeText({ text: `${won.length || ""}` })
}