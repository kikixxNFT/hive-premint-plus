import React from "react";
import { createStyles, CSSObject } from '@mantine/core'

export function Link({ href, target = '_blank', children, sx, ...props }: { href?: string, target?: string, children?: React.ReactNode, sx?: CSSObject }) {
    const useStyles = createStyles((theme) => ({
        link: {
            textDecoration: 'none',
            textTransform: 'uppercase',
            color: 'currentcolor',
            fontWeight: 800,
            position: 'relative',
            lineHeight: '24px',
            '&:before': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 0,
                height: '2px',
                backgroundColor: theme.colorScheme === 'dark' ? 'white' : 'black',
                transition: 'width 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
            },
            '&:hover::before': {
                left: 0,
                right: 'auto',
                width: '100%',
            },
            ...sx,
        },
    }));
    const { classes } = useStyles();
    return <a className={classes.link} href={href} target={target} {...props}>{children}</a >
}