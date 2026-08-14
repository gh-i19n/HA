import { iconRegistry, IconProvider } from './registry';
import { AnyIconName } from './types';
import { cn } from '@healthalst/ui/lib/utils';
import { ComponentType } from 'react';

interface IconProps {
  name: AnyIconName;
  provider?: IconProvider;
  size?: number;
  className?: string;
  color?: string;
  variant?: 'Linear' | 'Outline' | 'Bold' | 'Broken' | 'Bulk' | 'TwoTone';
  strokeWidth?: number;
}

export function Icon({
  name,
  provider,
  size = 20,
  className,
  color,
  variant = 'Bulk',
  strokeWidth,
  ...props
}: IconProps) {
  const resolvedProvider: IconProvider = provider
    ? provider
    : name in iconRegistry.iconsax
      ? 'iconsax'
      : 'lucide';
  const icons = iconRegistry[resolvedProvider];
  const Component = icons[name as keyof typeof icons] as
    | ComponentType<Record<string, unknown>>
    | undefined;

  if (!Component) {
    throw new Error(
      `Icon "${name}" not found in provider "${resolvedProvider}"`
    );
  }

  const sharedProps: Record<string, unknown> = {
    className: cn('shrink-0', className),
    ...props,
  };

  if (resolvedProvider === 'iconsax') {
    return (
      <Component
        size={size}
        color={color ?? 'currentColor'}
        variant={variant}
        {...sharedProps}
      />
    );
  }

  return <Component size={size} strokeWidth={strokeWidth} {...sharedProps} />;
}
