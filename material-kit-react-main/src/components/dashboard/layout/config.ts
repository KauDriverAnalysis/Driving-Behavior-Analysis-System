import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'tracking', title: 'Tracking', href: paths.dashboard.tracking, icon: 'map' },
  { key: 'employees', title: 'Employees', href: paths.dashboard.employees, icon: 'users' },
  { key: 'drivers', title: 'Drivers', href: paths.dashboard.drivers, icon: 'car' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
];