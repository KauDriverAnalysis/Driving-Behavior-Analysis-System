'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { NavItemConfig } from '@/types/nav';
import { isNavItemActive } from '@/lib/is-nav-item-active';

interface NavItemsProps {
  items: NavItemConfig[];
  sx?: object;
}

export function NavItems({ items, sx }: NavItemsProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Stack
      component="nav"
      spacing={1}
      sx={{
        ...sx,
        flexGrow: 1,
        alignItems: { lg: 'center' },
        flexDirection: { lg: 'row' },
      }}
    >
      {items.map((item) => {
        const checkPath = !!(item.href && pathname);
        const active = checkPath ? isNavItemActive({ href: item.href, pathname }) : false;

        return (
          <ButtonBase
            key={item.key}
            component={item.href ? RouterLink : 'div'}
            href={item.href}
            sx={{
              borderRadius: 1,
              color: 'text.secondary',
              fontSize: 14,
              fontWeight: 500,
              justifyContent: 'flex-start',
              px: 3,
              py: 1.5,
              textAlign: 'left',
              '&:hover': {
                backgroundColor: 'primary.alpha12'
              },
              ...(active && {
                color: 'primary.main',
                backgroundColor: 'primary.alpha12'
              })
            }}
          >
            <Box
              component="span"
              sx={{ flexGrow: 1 }}
            >
              {item.title}
            </Box>
          </ButtonBase>
        );
      })}
    </Stack>
  );
}