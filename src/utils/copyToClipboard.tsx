import React from 'react';
import { ThemeIcon } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { CircleCheck } from 'tabler-icons-react';

export function copyToClipboard({ value }: { value: string }) {
  navigator.clipboard.writeText(value);
  showNotification({
    id: 'saved-data',
    title: 'Success!',
    message: 'Copied text to clipboard',
    color: 'teal',
    icon: (
      <ThemeIcon variant="outline" color="gray" radius="xl">
        <CircleCheck size={48} strokeWidth={2} />
      </ThemeIcon>
    ),
    autoClose: 2000,
  });
}
