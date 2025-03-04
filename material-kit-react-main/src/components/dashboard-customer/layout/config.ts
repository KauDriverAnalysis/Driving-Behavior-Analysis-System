import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboardCustomer.overview, icon: 'chart-pie' },
  { key: 'page1', title: 'Page1', href: paths.dashboardCustomer.page1, icon: 'page1' },
  { key: 'page2', title: 'Page2', href: paths.dashboardCustomer.page2, icon: 'page2' },
  { key: 'carCustomers', title: 'CarCustomers', href: paths.dashboardCustomer.carCustomers, icon: 'car' },

];