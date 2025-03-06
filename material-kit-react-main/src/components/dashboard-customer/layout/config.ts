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
    key: 'page1', 
    title: 'Page1', 
    href: paths.dashboardCustomer.page1, 
    icon: 'page1' 
  },
  { 
    key: 'parentalControl', 
    title: 'Parental Control', 
    href: paths.dashboardCustomer.parentalControl, // Fix typo in path name
    icon: 'shield' 
  },
  { 
    key: 'carCustomers', 
    title: 'Car Customers', 
    href: paths.dashboardCustomer.carCustomers, 
    icon: 'car' 
  }
];