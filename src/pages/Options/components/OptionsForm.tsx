import { useFieldArray, useForm } from 'react-hook-form';
import { showNotification } from '@mantine/notifications';
import { CircleCheck, Plus, Minus } from 'tabler-icons-react';
import React, { useState } from 'react';
import {
  TextInput,
  Switch,
  Group,
  Button,
  ThemeIcon,
  Text,
  useMantineTheme,
  Box,
  Modal,
  List,
  Divider,
  Title,
  ScrollArea,
  ActionIcon,
} from '@mantine/core';
import { useSyncedStorageAtom } from '@utils/createSyncedStorageAtom';

type FormValues = {
  wallets: {
    wallet: string;
  }[];
  interval: number;
  autoDeleteLost: boolean;
  autoWatchOnRegister: boolean;
  autoOpenRegistrationLinks: boolean;
};

export function OptionsForm() {
  const [settings, setSettings] = useSyncedStorageAtom();
  const [opened, setOpened] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const {
    wallet,
    wallets,
    interval,
    autoDeleteLost,
    autoWatchOnRegister,
    autoOpenRegistrationLinks,
    colorScheme,
  } = settings;
  const theme = useMantineTheme();
  const { register, handleSubmit, formState, control } = useForm<FormValues>({
    defaultValues: {
      wallets: wallets || [{ wallet }],
      interval,
      autoDeleteLost,
      autoWatchOnRegister,
      autoOpenRegistrationLinks,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'wallets',
  });

  const { errors, isSubmitting } = formState;

  async function onSubmit(values: FormValues) {
    setSettings({ ...settings, ...values });
    showNotification({
      id: 'saved-data',
      title: 'Success!',
      message: 'Saved settings to storage',
      color: 'teal',
      icon: (
        <ThemeIcon variant="outline" color="gray" radius="xl">
          <CircleCheck size={48} strokeWidth={2} />
        </ThemeIcon>
      ),
      autoClose: 2000,
    });
  }

  async function handleImport() {
    // make sure to avoid importing duplicates
    setIsImporting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsImporting(false);
    setOpened(false);
  }

  return (
    <>
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '32px',
          border: `1px solid ${
            colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.dark[7]
          }`,
          borderRadius: '6px',
          height: '100%',
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextInput
          disabled
          label="Hive Alpha Wallet"
          placeholder="0x..."
          radius="md"
          value={wallet}
        />
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <Title order={4}>Wallets</Title>
          <Group pr="12px" position="right">
            <ActionIcon
              variant="outline"
              size="xs"
              color="grape"
              type="button"
              onClick={() => {
                append({ wallet: '' });
              }}
            >
              <Plus size={16} />
            </ActionIcon>
          </Group>
        </Box>
        <ScrollArea offsetScrollbars type="hover" sx={{ maxHeight: '210px' }}>
          <List spacing="xs">
            {fields.map((item, index) => {
              return (
                <List.Item sx={{ listStyle: 'none' }} key={item.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                    }}
                  >
                    <TextInput
                      label={`Wallet ${index + 1}`}
                      placeholder="0x..."
                      radius="md"
                      required
                      sx={{
                        input: {
                          width: '28ch',
                          marginRight: '10px',
                        },
                      }}
                      {...register(`wallets.${index}.wallet` as const, {
                        required: true,
                      })}
                    />
                    <ActionIcon
                      sx={{ marginBottom: '10px' }}
                      variant="outline"
                      size="xs"
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <Minus size={16} />
                    </ActionIcon>
                  </Box>
                </List.Item>
              );
            })}
          </List>
        </ScrollArea>
        <TextInput
          type="number"
          defaultValue={720}
          placeholder="720"
          label="Refresh interval (mins) for checking Premint results"
          radius="md"
          required
          sx={{
            input: {
              borderColor: errors.interval ? 'red' : 'inherit',
            },
          }}
          {...register('interval', {
            valueAsNumber: true,
            min: {
              value: 30,
              message: 'Invalid interval. Minimum 30 minute intervals allowed.',
            },
          })}
        />
        {errors.interval && (
          <Text sx={{ color: 'red', fontSize: '12px', lineHeight: 1 }}>
            {errors.interval.message}
          </Text>
        )}

        <Switch
          color="grape"
          label={`Automatically remove from watchlist on "lost"`}
          {...register('autoDeleteLost')}
        />
        <Switch
          color="grape"
          label="Automatically add to watchlist on register"
          {...register('autoWatchOnRegister')}
        />
        <Switch
          color="grape"
          label="Automatically open Discord and follow Twitter when adding to watchlist"
          {...register('autoOpenRegistrationLinks')}
        />

        <Button variant="outline" onClick={() => setOpened(true)}>
          Auto import previous raffles
        </Button>

        <Group position="right" mt="md">
          <Button color="grape" type="submit">
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </Group>
      </form>
      <Modal
        centered
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Text sx={{ fontWeight: 700 }}>Warning</Text>}
        styles={{
          modal: {
            border: `1px solid ${
              colorScheme === 'dark'
                ? theme.colors.dark[0]
                : theme.colors.dark[7]
            }`,
          },
        }}
      >
        <Box sx={{ display: 'grid', gap: '16px' }}>
          <Text>
            This will automatically import all your previously entered raffles,
            excluding those you did not win.
          </Text>
          <Text>
            A lot of raffles do not post results and you may end up with more
            raffles than you thought! Please make sure you want all your
            previous raffle entries added, as you will need to remove any
            unwated raffles manually afterward.
          </Text>
          <Group position="right" mt="md">
            <Button
              disabled={isImporting}
              variant="outline"
              type="button"
              onClick={() => setOpened(false)}
            >
              {'Cancel'}
            </Button>
            <Button
              disabled={isImporting}
              color="grape"
              type="button"
              onClick={handleImport}
            >
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
}
