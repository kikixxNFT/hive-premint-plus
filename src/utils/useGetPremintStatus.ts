import { useQuery } from 'react-query';
import axios from 'axios';
import { RaffleData } from './useSettingsStore';

export const UNREGISTERED: { wording: string, status: RaffleData['status'] } = {
    wording: `You aren't registered.`,
    status: 'register',
}

export const statuses: { [key: string]: RaffleData['status'] } = {
    '😢': 'lost',
    '🏆': 'won',
    '👍': 'registered',
    'unknown': 'unknown',
}

export async function fetchStatus({ url, wallet }: { url: string, wallet: string }): Promise<{ url: string, status: RaffleData['status'] }> {
    const { data } = await axios.get(`${url}/verify/?wallet=${wallet}`);
    const parser = new DOMParser();
    const document = parser.parseFromString(data, "text/html");
    const textStatus = document?.querySelector('.card .card-body div:nth-child(2)')?.textContent
    const emojiStatus = document?.querySelector('.card .card-body div:nth-child(1)')?.textContent
    const status = textStatus?.includes(UNREGISTERED.wording) ? UNREGISTERED.status : statuses[emojiStatus || 'unknown']
    return { url, status }
}

export function useGetPremintStatus({ url, wallet }: { url: string, wallet: string }) {
    return useQuery(
        [`${url}/verify/`, wallet],
        async () => {
            return await fetchStatus({ url, wallet })
        },
        {
            staleTime: 12 * 60 * 60 * 1000
        });
}
