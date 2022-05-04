import React from 'react';
import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  Box,
  TextInput,
  Loader,
  Switch,
  Group,
  Button,
  useMantineTheme,
  ThemeIcon,
  Text,
} from '@mantine/core';
import {
  useSettingsStore,
} from '@utils/useSettingsStore';
import {
  NotificationsProvider,
  showNotification,
} from '@mantine/notifications';
import { CircleCheck } from 'tabler-icons-react';
import { Header } from '@components/Header';
import { useForm } from 'react-hook-form';
import { ethers, BigNumber } from 'ethers';
import { abi, contractAddress, rpc } from '@assets/hive-alpha';

const Options = () => {
  const { storageData: settings, setStorageData, isLoading } = useSettingsStore();
  const { wallet, interval, autoDeleteLost, autoWatchOnRegister, colorScheme } = settings
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const contractInstance = new ethers.Contract(contractAddress, abi, provider);
  
  const theme = useMantineTheme();
  const toggleColorScheme = (value?: ColorScheme) => {
    setStorageData({
      ...settings,
      colorScheme: value || colorScheme === 'dark' ? 'light' : 'dark',
    });
  }

  type FormValues = {
    wallet: string;
    interval: number;
    autoDeleteLost: boolean;
    autoWatchOnRegister: boolean;
  };

  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      wallet,
      interval,
      autoDeleteLost,
      autoWatchOnRegister,
    },
  });

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
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: 'lg', fontFamily: 'Inter' }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NotificationsProvider>
          <Header withLegend={false} withSettings={false} />
          <Box
            sx={{
              paddingBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            {isLoading ? <Loader color="violet" /> :
            <form
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '32px',
                border: `1px solid ${
                  colorScheme === 'dark'
                    ? theme.colors.dark[0]
                    : theme.colors.dark[7]
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
                        const alphaPasses = await contractInstance.balanceOf(
                          value,
                          2
                        );
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
                      message:
                        'Invalid interval. Minimum 30 minute intervals allowed.',
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
            </form>}
          </Box>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default Options;
