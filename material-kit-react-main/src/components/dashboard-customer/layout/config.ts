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
    key: 'parentalControl', 
    title: 'Parental Control', 
    href: paths.dashboardCustomer.parentalControl, // Fix typo in path name
    icon: 'shield' 
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
    icon: 'user' 
  }
];