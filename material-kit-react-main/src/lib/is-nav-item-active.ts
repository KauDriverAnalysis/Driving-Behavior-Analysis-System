import type { NavItemConfig } from '@/types/nav';

export function isNavItemActive({
  disabled,
  external,
  href,
  matcher,
  pathname,
}: Pick<NavItemConfig, 'disabled' | 'external' | 'href' | 'matcher'> & { pathname: string }): boolean {
  if (disabled || !href || external) {
    return false;
  }

  // If there's a RegExp matcher, use it to test the pathname
  if (matcher instanceof RegExp) {
    return matcher.test(pathname);
  }

  // Default to exact match
  return pathname === href;
}
