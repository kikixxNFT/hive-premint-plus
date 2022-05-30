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
  Loader,
} from '@mantine/core';
import {
  BrandDiscord,
  BrandTwitter,
  CircleMinus,
  Link as LinkIcon,
  CalendarEvent,
  Coin,
} from 'tabler-icons-react';
import { useSyncedStorageAtom } from '@utils/createSyncedStorageAtom';
import { setBadgeText } from '@utils/setBadgeText';
import { Icon } from '@components/Icon';
import { Link } from '@components/Link';
import { produce, createDraft, finishDraft } from 'immer';
import { UseQueryResult } from 'react-query';

export function RaffleList({
  selectedWallet,
  premintQueries,
}: {
  selectedWallet: number;
  premintQueries: UseQueryResult<
    {
      url: string;
      status: 'unknown' | 'lost' | 'register' | 'registered' | 'won';
    },
    unknown
  >[];
}) {
  const [settings, setSettings] = useSyncedStorageAtom();
  const [isHovered, setIsHovered] = useState('');
  const { autoDeleteLost, raffles, wallets, isLoading } = settings;
  const wallet = wallets?.[selectedWallet].wallet || '';
  const filteredraffles = raffles?.[wallet];

  useEffect(() => {
    if (premintQueries.length > 0) {
      const draft = createDraft(settings);
      let updated = false;
      for (let { dataUpdatedAt, data, isLoading } of premintQueries) {
        if (!isLoading) {
          const url = data?.url || 'unknown';
          const status = data?.status || 'unknown';
          if (draft.raffles[wallet].hasOwnProperty(url)) {
            draft.raffles[wallet][url].status = status;
            draft.raffles[wallet][url].updated_at = dataUpdatedAt;
          }

          if (autoDeleteLost && status === 'lost') {
            delete draft.raffles[wallet][url];
          }
          updated = true;
        }
      }
      if (updated) {
        const newSettings = finishDraft(draft);
        setSettings(newSettings);
      }
    }
  }, [
    autoDeleteLost,
    premintQueries,
    selectedWallet,
    setSettings,
    settings,
    wallet,
  ]);

  function handleDelete({ url }: { url: string }) {
    const newSettings = produce(settings, (draft) => {
      delete draft.raffles[wallet][url];
    });
    setIsHovered('');
    setSettings(newSettings);
    setBadgeText({ raffles: newSettings.raffles, selectedWallet, wallet });
  }

  return (
    <ScrollArea
      type="hover"
      sx={{ overflow: 'auto', maxHeight: 380, height: 'fit-content' }}
      mb="xs"
      px="xs"
    >
      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <Loader color="violet" />
        </Box>
      ) : (
        <List spacing="xs" size="sm" center>
          {filteredraffles &&
            Object.entries(filteredraffles).map(([url, data]) => (
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
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
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
                          <Text sx={{ fontSize: '14px' }}>
                            {data?.raffle_time}
                          </Text>
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
      )}
    </ScrollArea>
  );
}
