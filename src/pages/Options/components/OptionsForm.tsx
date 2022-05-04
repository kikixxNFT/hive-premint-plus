import { useForm } from 'react-hook-form';
import { Settings } from '@utils/useSettingsStore';
import { showNotification } from '@mantine/notifications';
import { CircleCheck } from 'tabler-icons-react';
import React from 'react';
import {
  TextInput,
  Switch,
  Group,
  Button,
  ThemeIcon,
  Text,
  useMantineTheme,
} from '@mantine/core';

import { ethers, BigNumber } from 'ethers';
import { abi, contractAddress, rpc } from '@assets/hive-alpha';

type FormValues = {
  wallet: string;
  interval: number;
  autoDeleteLost: boolean;
  autoWatchOnRegister: boolean;
};

export function OptionsForm({
  setStorageData,
  settings,
}: {
  setStorageData: (data: Settings) => void;
  settings: Settings;
}) {
  const { wallet, interval, autoDeleteLost, autoWatchOnRegister, colorScheme } =
    settings;
  const theme = useMantineTheme();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      wallet,
      interval,
      autoDeleteLost,
      autoWatchOnRegister,
    },
  });
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const contractInstance = new ethers.Contract(contractAddress, abi, provider);

  const { errors, isSubmitting } = formState;

  async function onSubmit(values: FormValues) {
    setStorageData({ ...settings, ...values });
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

  return (
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
      }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextInput
        required
        label="Wallet"
        placeholder="0x..."
        radius="md"
        sx={{
          input: {
            borderColor: errors.wallet ? 'red' : 'inherit',
          },
        }}
        {...register('wallet', {
          validate: {
            hiveHolder: async (value) => {
              let response: boolean | string = true;
              try {
                const foundersPasses = await contractInstance.balanceOf(
                  value,
                  1
                );
                const alphaPasses = await contractInstance.balanceOf(value, 2);
                response = true;
              } catch (e) {
                response = 'Invalid wallet address.';
              }
              return response;
            },
          },
        })}
      />
      {errors.wallet && (
        <Text sx={{ color: 'red', fontSize: '12px', lineHeight: 1 }}>
          {errors.wallet.message}
        </Text>
      )}
      {
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
      }
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

      <Group position="right" mt="md">
        <Button color="grape" type="submit">
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </Group>
    </form>
  );
}
