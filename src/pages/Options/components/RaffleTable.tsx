import React, { useCallback, useEffect, useState } from 'react';
import { ActionIcon, Anchor, Box, Table, Tooltip } from '@mantine/core';
import { Link } from '@components/Link';
import {
  Minus,
  BrandDiscord,
  BrandTwitter,
  Link as LinkIcon,
} from 'tabler-icons-react';
import produce from 'immer';
import { Icon } from '@components/Icon';
import { useSyncedStorageAtom } from '@utils/createSyncedStorageAtom';

export function RaffleTable({ selectedWallet }: { selectedWallet: number }) {
  const [settings, setSettings] = useSyncedStorageAtom();
  const [rows, setRows] = useState<React.ReactNode[]>([]);
  const wallet = settings?.wallets?.[selectedWallet]?.wallet || '';

  const handleDelete = useCallback(
    function handleDelete({ key }: { key: string }) {
      const newSettings = produce(settings, (draft) => {
        delete draft.raffles[wallet][key];
      });
      setSettings(newSettings);
    },
    [setSettings, settings, wallet]
  );

  useEffect(() => {
    const newRows =
      settings?.raffles?.[wallet] &&
      Object.entries(settings.raffles[wallet])?.map(([key, raffle]) => (
        <tr key={key}>
          <td>
            <Link
              href={key}
              sx={{
                color: raffle?.status === 'lost' ? 'gray' : 'inherit',
                textDecoration:
                  raffle?.status === 'lost' ? 'line-through' : 'none',
              }}
            >
              {raffle?.name}
            </Link>
          </td>
          <td>
            <Icon type={raffle?.status} />
          </td>
          <td>{raffle?.registration_closes || '-'}</td>
          <td>{raffle?.raffle_time || '-'}</td>
          <td>{raffle?.mint_date || '-'}</td>
          <td>{raffle?.mint_price || '-'}</td>
          <td>
            <Box
              sx={{
                display: 'flex',
                gap: '8px',
                alignItems: 'baseline',
                justifyContent: 'flex-end',
              }}
            >
              {raffle?.official_link && (
                <Anchor
                  sx={{ color: 'gray' }}
                  href={`https://${raffle?.official_link}`}
                  target="_blank"
                >
                  <LinkIcon size={24} />
                </Anchor>
              )}
              {raffle?.twitter_link && (
                <Anchor
                  sx={{ color: '#1DA1F2' }}
                  href={raffle?.twitter_link}
                  target="_blank"
                >
                  <BrandTwitter size={24} />
                </Anchor>
              )}
              {raffle?.discord_link && (
                <Anchor
                  sx={{ color: '#5865F2' }}
                  href={raffle?.discord_link}
                  target="_blank"
                >
                  <BrandDiscord size={24} />
                </Anchor>
              )}
              <Tooltip
                label="Remove raffle from watchlist"
                position="top"
                placement="end"
                withArrow
              >
                <ActionIcon
                  color="red"
                  variant="outline"
                  size="xs"
                  type="button"
                  onClick={() => handleDelete({ key })}
                >
                  <Minus size={24} />
                </ActionIcon>
              </Tooltip>
            </Box>
          </td>
        </tr>
      ));
    setRows(newRows);
  }, [handleDelete, selectedWallet, settings.raffles, wallet]);

  return rows?.length === 0 ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      No Raffles assigned to this wallet fren!
    </Box>
  ) : (
    <Table highlightOnHover>
      <thead>
        <tr>
          <th>Raffle</th>
          <th>Status</th>
          <th>Registration Closes</th>
          <th>Raffle Time</th>
          <th>Mint Date</th>
          <th>Mint Price</th>
          <th style={{ textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
}
