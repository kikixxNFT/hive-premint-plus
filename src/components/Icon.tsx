import React from 'react';
import { ThemeIcon, Group, Text, ThemeIconVariant } from '@mantine/core';
import {
  CircleCheck,
  CircleDashed,
  Trophy,
  CircleX,
  QuestionMark,
} from 'tabler-icons-react';

type Icon = Record<
  'lost' | 'register' | 'registered' | 'won' | 'unknown' | 'legend',
  React.ReactElement
>;

const LostIcon = ({ variant }: { variant?: ThemeIconVariant }) => (
  <ThemeIcon variant={variant} color="gray" size={24} radius="xl">
    <CircleX size={16} />
  </ThemeIcon>
);
const RegisterIcon = ({ variant }: { variant?: ThemeIconVariant }) => (
  <ThemeIcon variant={variant} color="blue" size={24} radius="xl">
    <CircleDashed size={16} />
  </ThemeIcon>
);
const RegisteredIcon = ({ variant }: { variant?: ThemeIconVariant }) => (
  <ThemeIcon variant={variant} color="green" size={24} radius="xl">
    <CircleCheck size={16} />
  </ThemeIcon>
);
const WonIcon = ({ variant }: { variant?: ThemeIconVariant }) => (
  <ThemeIcon variant={variant} color="yellow" size={24} radius="xl">
    <Trophy size={16} />
  </ThemeIcon>
);
const UnknownIcon = ({ variant }: { variant?: ThemeIconVariant }) => (
  <ThemeIcon variant={variant} color="gray" size={24} radius="xl">
    <QuestionMark size={16} />
  </ThemeIcon>
);

const icons: Icon = {
  lost: <LostIcon variant="outline" />,
  register: <RegisterIcon variant="outline" />,
  registered: <RegisteredIcon variant="outline" />,
  won: <WonIcon variant="outline" />,
  unknown: <UnknownIcon variant="outline" />,
  legend: (
    <>
      <Group spacing="xs">
        <RegisterIcon />
        <Text>Unregistered</Text>
      </Group>
      <Group spacing="xs">
        <RegisteredIcon />
        <Text>Registered</Text>
      </Group>
      <Group spacing="xs">
        <LostIcon />
        <Text>Lost</Text>
      </Group>
      <Group spacing="xs">
        <WonIcon />
        <Text>Won</Text>
      </Group>
      <Group spacing="xs">
        <UnknownIcon />
        <Text>Unknown</Text>
      </Group>
    </>
  ),
};

export function Icon({ type }: { type: keyof Icon }) {
  return icons[type];
}
