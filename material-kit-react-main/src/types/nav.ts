export type NavIcon = 
  | 'chart-pie'
  | 'chart-line'
  | 'shield'
  | 'map'
  | 'map-pin'
  | 'user'
  | 'users'
  | 'car'
  | 'car-simple'
  | 'driver'
  | 'user-focus'
  | 'gear-six'
  | 'x-square'
  | 'draw-polygon'
  | 'user-circle';

export interface NavItemConfig {
  key: string;
  title: string;
  href?: string;
  icon?: NavIcon;
  disabled?: boolean;
  external?: boolean;
  matcher?: RegExp;
  items?: NavItemConfig[];
}