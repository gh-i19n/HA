import * as Lucide from './lucide';
import * as Iconsax from './iconsax';

export const iconRegistry = {
  lucide: Lucide,
  iconsax: Iconsax,
} as const;

export type IconProvider = keyof typeof iconRegistry;
