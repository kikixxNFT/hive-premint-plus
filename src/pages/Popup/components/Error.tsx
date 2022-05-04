import React from 'react'
import { Box, CSSObject, Text } from '@mantine/core';
import { MoodSad } from 'tabler-icons-react';

export function Error({ message, icon, sx }: { message: React.ReactNode, icon?: React.ReactNode, sx?: CSSObject }) {
    return (
        <Box sx={{ display: 'flex', gap: '8px', paddingBottom: '10px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 400, height: 180, ...sx }}>
            {!icon ? <MoodSad
                size={48}
                strokeWidth={2}
                color={'gray'}
            /> : icon}
            <Text>{message}</Text>
        </Box>
    )
}