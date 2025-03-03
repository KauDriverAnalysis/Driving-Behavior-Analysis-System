import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';


export const navItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboardAdmin.overview, icon: 'chart-pie' },
  { key: 'tracking', title: 'Tracking', href: paths.dashboardAdmin.tracking, icon: 'map' },
  { key: 'employees', title: 'Employees', href: paths.dashboardAdmin.employees, icon: 'users' },
  { key: 'drivers', title: 'Drivers', href: paths.dashboardAdmin.drivers, icon: 'driver' },
  { key: 'cars', title: 'Cars', href: paths.dashboardAdmin.cars, icon: 'car' },
  { key: 'settings', title: 'Settings', href: paths.dashboardAdmin.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboardAdmin.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
];