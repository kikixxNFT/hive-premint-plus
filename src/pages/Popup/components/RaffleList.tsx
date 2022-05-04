import React, { useEffect, useState } from 'react';
import {
  List,
  ActionIcon,
  ScrollArea,
  Tooltip,
  Accordion,
  Text,
  Box,
  Anchor,
} from '@mantine/core';
import {
  BrandDiscord,
  BrandTwitter,
  CircleMinus,
  Link as LinkIcon,
  CalendarEvent,
  Coin,
} from 'tabler-icons-react';
import { useSettingsStore } from '@utils/useSettingsStore';
import { setBadgeText } from '@utils/setBadgeText';
import { Icon } from '@components/Icon';
import { Link } from '@components/Link';
import { produce, createDraft, finishDraft } from 'immer';
import { useQueries } from 'react-query';
import { fetchStatus } from '@utils/useGetPremintStatus';

export function RaffleList({ wallet }: { wallet: string }) {
  const { storageData: settings, setStorageData } = useSettingsStore();
  const { interval, autoDeleteLost, raffles } = settings;
  const [isHovered, setIsHovered] = useState('');

  const premintQueries = useQueries(
    Object.entries(raffles)
      .filter(
        ([, data]) => Date.now() - data?.updated_at >= interval * 60 * 1000
      )
      .map(([url]) => ({
        queryKey: [`${url}/verify/`, wallet],
        queryFn: () => fetchStatus({ url, wallet }),
      }))
  );

  useEffect(() => {
    if (premintQueries.length > 0) {
      const draft = createDraft(settings);
      let updated = false;
      for (let { dataUpdatedAt, data, isLoading } of premintQueries) {
        if (!isLoading) {
          const url = data?.url || 'unknown';
          const status = data?.status || 'unknown';
          if (draft.raffles.hasOwnProperty(url)) {
            draft.raffles[url].status = status;
            draft.raffles[url].updated_at = dataUpdatedAt;
          }

          if (autoDeleteLost && status === 'lost') {
            delete draft.raffles[url];
          }
          updated = true;
        }
      }
      if (updated) {
        const newSettings = finishDraft(draft);
        setStorageData(newSettings);
        setBadgeText({ raffles: newSettings.raffles });
      }
    }
  }, [autoDeleteLost, premintQueries, setStorageData, settings]);

  function handleDelete({ url }: { url: string }) {
    const newSettings = produce(settings, (draft) => {
      delete draft.raffles[url];
    });
    setIsHovered('');
    setStorageData(newSettings);
    setBadgeText({ raffles: newSettings.raffles });
  }

  return (
    <ScrollArea
      type="hover"
      sx={{ overflow: 'auto', maxHeight: 380, height: 'fit-content' }}
      mb="xs"
      px="xs"
      pt="56px"
    >
      <List spacing="xs" size="sm" center>
        {Object.entries(raffles).map(([url, data]) => (
          <List.Item
            sx={{
              ':not(:first-of-type)': { marginTop: '0px' },
              listStyle: 'none',
            }}
            onMouseEnter={() => setIsHovered(data?.name)}
            onMouseLeave={() => setIsHovered('')}
            key={data?.name}
          >
            <Accordion
              styles={{
                control: { paddingTop: '8px', paddingBottom: '8px' },
                label: {
                  color: data?.status === 'lost' ? 'gray' : 'inherit',
                  textDecoration:
                    data?.status === 'lost' ? 'line-through' : 'none',
                },
              }}
              disableIconRotation
              icon={
                isHovered === data?.name ? (
                  <Tooltip
                    label="Delete?"
                    position="top"
                    placement="end"
                    withArrow
                  >
                    <ActionIcon
                      component="div"
                      variant="outline"
                      color="red"
                      onClick={() => handleDelete({ url })}
                      size={24}
                    >
                      <CircleMinus size={16} />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <Icon type={data?.status} />
                )
              }
            >
              <Accordion.Item
                label={
                  <Text
                    sx={{
                      textTransform: 'uppercase',
                      color: 'currentcolor',
                      fontWeight: 800,
                    }}
                  >
                    {data?.name}
                  </Text>
                }
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Link href={`${url}/verify/?wallet=${wallet}`}>
                    {'premint'}
                  </Link>
                  <Box sx={{ display: 'flex', gap: '8px' }}>
                    {data?.official_link && (
                      <Anchor
                        sx={{ color: 'gray' }}
                        href={`https://${data?.official_link}`}
                        target="_blank"
                      >
                        <LinkIcon size={24} />
                      </Anchor>
                    )}
                    {data?.twitter_link && (
                      <Anchor
                        sx={{ color: '#1DA1F2' }}
                        href={data?.twitter_link}
                        target="_blank"
                      >
                        <BrandTwitter size={24} />
                      </Anchor>
                    )}
                    {data?.discord_link && (
                      <Anchor
                        sx={{ color: '#5865F2' }}
                        href={data?.discord_link}
                        target="_blank"
                      >
                        <BrandDiscord size={24} />
                      </Anchor>
                    )}
                  </Box>
                </Box>
                <List spacing="xs" size="sm" center>
                  {data?.registration_closes && (
                    <List.Item icon={<CalendarEvent size={16} />}>
                      <Text sx={{ fontSize: '12px', fontWeight: 700 }}>
                        Registration Date
                      </Text>
                      <Text sx={{ fontSize: '14px' }}>
                        {data?.registration_closes}
                      </Text>
                    </List.Item>
                  )}
                  {data?.raffle_time && (
                    <List.Item icon={<CalendarEvent size={16} />}>
                      <Text sx={{ fontSize: '12px', fontWeight: 700 }}>
                        Raffle Date
                      </Text>
                      <Text sx={{ fontSize: '14px' }}>{data?.raffle_time}</Text>
                    </List.Item>
                  )}
                  {data?.mint_date || data?.mint_price ? (
                    <List.Item icon={<Coin size={16} />}>
                      <Text sx={{ fontSize: '12px', fontWeight: 700 }}>
                        Mint
                      </Text>
                      <Text sx={{ fontSize: '14px' }}>
                        {data?.mint_date && data?.mint_price
                          ? `${data?.mint_date} for ${data?.mint_price}`
                          : data?.mint_date
                          ? data?.mint_date
                          : data?.mint_price}
                      </Text>
                    </List.Item>
                  ) : null}
                </List>
              </Accordion.Item>
            </Accordion>
          </List.Item>
        ))}
      </List>
    </ScrollArea>
  );
}
