import { iconRegistry } from './registry';

type Registry = typeof iconRegistry;

export type IconName<P extends keyof Registry> = keyof Registry[P];

export type AnyIconName = keyof Registry['lucide'] | keyof Registry['iconsax'];
