import React from 'react';
import { Navbar, Group, ActionIcon, Box, useMantineColorScheme, Tooltip } from '@mantine/core';
import { Sun, MoonStars, Settings as SettingsIcon, QuestionMark } from 'tabler-icons-react';
import { Logo } from './Logo'
import { Icon } from './Icon'

export function Header({ withLegend = true, withSettings = true }: { withLegend?: boolean, withSettings?: boolean }) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    function openSettings() {
        chrome.tabs.create({
            url: '/options.html'
        });
    }

    return (
        <Navbar height="fit-content" pt="xs" pl="xs" pr="xs">
            <Navbar.Section>
                <Box
                    sx={(theme) => ({
                        paddingLeft: theme.spacing.xs,
                        paddingBottom: theme.spacing.xs,
                        borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
                            }`,
                    })}
                >
                    <Group noWrap position="apart">
                        <Logo colorScheme={colorScheme} />
                        <Group noWrap spacing="xs">
                            {withLegend && (
                                <Tooltip
                                    label={<Icon type="legend" />}
                                    position="top"
                                    placement="end"
                                    withArrow
                                >
                                    <ActionIcon variant="outline" color="gray" size={16} radius="xl">
                                        <QuestionMark size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                            <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
                                {colorScheme === 'dark' ? <Sun size={16} /> : <MoonStars size={16} />}
                            </ActionIcon>
                            {withSettings && (
                                <ActionIcon variant="default" onClick={() => openSettings()} size={30}>
                                    <SettingsIcon size={30} />
                                </ActionIcon>
                            )}
                        </Group>
                    </Group>
                </Box>
            </Navbar.Section>
        </Navbar>
    )
}