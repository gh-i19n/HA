'use client';

import type { AnyIconName } from '@healthalst/ui/lib/icons/types';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export interface NavigationItem {
  name: string;
  url: string;
  icon?: AnyIconName;
  isActive?: boolean;
  subItems?: readonly {
    readonly name: string;
    readonly url: string;
    readonly isActive?: boolean;
  }[];
}

export const useActiveNavigation = <TItem extends NavigationItem>(
  items: readonly TItem[]
) => {
  const pathname = usePathname();

  return useMemo(() => {
    const path = pathname || '/';

    return items.map((item) => {
      const isActive = path === item.url || path.startsWith(item.url + '/');

      // Check if any sub-items are active
      const hasActiveSubItem =
        item.subItems?.some(
          (subItem) =>
            path === subItem.url || path.startsWith(subItem.url + '/')
        ) || false;

      return {
        ...item,
        isActive: isActive || hasActiveSubItem,
        subItems: item.subItems?.map((subItem) => ({
          ...subItem,
          isActive: path === subItem.url || path.startsWith(subItem.url + '/'),
        })),
      };
    });
  }, [items, pathname]);
};
