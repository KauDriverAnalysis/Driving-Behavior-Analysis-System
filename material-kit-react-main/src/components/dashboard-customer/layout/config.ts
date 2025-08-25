import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  {
    key: 'overview',
    title: 'Overview',
    href: paths.dashboardCustomer.overview,
    icon: 'chart-pie'
  },
  {
    key: 'simulation',
    title: 'Simulation',
    href: paths.dashboardCustomer.simulation,
    icon: 'simulation'
  },
  {
    key: 'parentalControl',
    title: 'Parental Control',
    href: paths.dashboardCustomer.parentalControl,
    icon: 'shield'
  },
  {
    key: 'geofencing',
    title: 'Geofencing',
    href: paths.dashboardCustomer.geofencing,
    icon: 'geofencing' // Updated icon key for Geofencing
  },
  {
    key: 'carCustomers',
    title: 'Cars',
    href: paths.dashboardCustomer.carCustomers,
    icon: 'car'
  },
  {
    key: 'account',
    title: 'Account',
    href: paths.dashboardCustomer.account,
    icon: 'account' // Updated icon key for Account
  }
];