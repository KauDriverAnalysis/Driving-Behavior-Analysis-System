'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';
import { NoSsr } from '@/components/core/no-ssr';

// Much larger dimensions for the logo
const HEIGHT = 180;  // Tripled from original 60
const WIDTH = 720;   // Tripled from original 240

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
  let url: string;

  if (emblem) {
    url = color === 'light' ? '/assets/logo-emblem.svg' : '/assets/logo-emblem--dark.svg';
  } else {
    url = color === 'light' ? '/assets/logo-q.png' : '/assets/logo-d.png';
  }

  return (
    <Box
      alt="logo"
      component="img"
      height={height}
      width={width}
      src={url}
      sx={{
        objectFit: 'contain',
        objectPosition: 'left center',
        maxWidth: '100%',
        display: 'block',
        transform: 'scale(1.8)', // Makes logo 20% larger
        transformOrigin: 'left center',
        '@media (max-width: 1200px)': {
          transform: 'scale(1)', // Original size on medium screens
          height: height * 0.8,
          width: width * 0.8,
        },
        '@media (max-width: 600px)': {
          transform: 'scale(0.9)', // Slightly smaller on mobile
          height: height * 0.6,
          width: width * 0.6,
        }
      }}
    />
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
