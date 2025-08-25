import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { Shield as ShieldIcon } from '@phosphor-icons/react/dist/ssr/Shield';
import { Car as CarIcon } from '@phosphor-icons/react/dist/ssr/Car';
import { UserCircle as AccountIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { Polygon as GeofencingIcon } from '@phosphor-icons/react/dist/ssr/Polygon'; // Updated import
import { Play as PlayIcon } from '@phosphor-icons/react/dist/ssr/Play';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
  shield: ShieldIcon,
  car: CarIcon,
  account: AccountIcon, // Ensure this key matches the one used in config.ts
  geofencing: GeofencingIcon, // Updated icon for Geofencing
  play: PlayIcon,
} as Record<string, Icon>;