export interface NavItemConfig {
  key: string;
  title: string; // Make title required
  disabled?: boolean;
  external?: boolean;
  label?: string;
  icon?: string; // Make icon required
  href: string; // Make href required
  items?: NavItemConfig[];
  matcher?: { type: 'startsWith' | 'equals'; href: string };
}
