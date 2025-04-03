'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';
import { NoSsr } from '@/components/core/no-ssr';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
// Import Material-UI Icons
import SecurityIcon from '@mui/icons-material/Security';

// Adjust dimensions as needed
const HEIGHT = 40;
const WIDTH = 180;

type Color = 'dark' | 'light';

export interface LogoProps {
    color?: Color;
    emblem?: boolean;
    height?: number;
    width?: number;
}

export function Logo({
    color = 'dark',
    emblem,
    height = HEIGHT,
    width = WIDTH
}: LogoProps): React.JSX.Element {
    const iconColor = color === 'light' ? '#fff' : '#1976d2';

    if (emblem) {
        return (
            <Box
                sx={{
                    height: height,
                    width: height, // Use height for width to maintain aspect ratio
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <SecurityIcon
                    sx={{
                        fontSize: height,
                        color: iconColor,
                    }}
                />
            </Box>
        );
    }

    // For full logo, use text + icon
    return (
        <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            component="div"
            sx={{
                height: height,
                width: width,
                textDecoration: 'none !important',
                '& a': { textDecoration: 'none' }, // Remove underline from any anchor parent
            }}
        >
            <SecurityIcon
                sx={{
                    fontSize: height,
                    color: iconColor,
                }}
            />
            <Box sx={{ 
                // Use a wrapper Box to override any inherited styles
                '&, & *': { 
                    textDecoration: 'none !important',
                    borderBottom: 'none !important'
                }
            }}>
                <Typography
                    variant="h6"
                    component="span"
                    sx={{
                        fontWeight: 700,
                        color: iconColor,
                        letterSpacing: '0.5px',
                        fontSize: height * 0.5,
                        lineHeight: 1,
                        textDecoration: 'none !important',
                        borderBottom: 'none !important',
                        '&::after': { display: 'none !important' }, // Remove any pseudo-elements
                        '&::before': { display: 'none !important' },
                    }}
                >
                    SafeMotion
                </Typography>
            </Box>
        </Stack>
    );
}

export interface DynamicLogoProps {
    colorDark?: Color;
    colorLight?: Color;
    emblem?: boolean;
    height?: number;
    width?: number;
}

export function DynamicLogo({
    colorDark = 'light',
    colorLight = 'dark',
    height = HEIGHT,
    width = WIDTH,
    ...props
}: DynamicLogoProps): React.JSX.Element {
    const { colorScheme } = useColorScheme();
    const color = colorScheme === 'dark' ? colorDark : colorLight;

    return (
        <NoSsr fallback={<Box sx={{ height: `${height}px`, width: `${width}px` }} />}>
            <Logo color={color} height={height} width={width} {...props} />
        </NoSsr>
    );
}
