import { cn } from '@healthalst/ui/lib/utils';
import { Icon } from './icons/icon';
import type { AnyIconName } from './icons/types';
import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: AnyIconName;
}

interface BreadcrumbsProps extends React.ComponentProps<'nav'> {
  items: BreadcrumbItem[];
}

function Breadcrumbs({ items, className, ...properties }: BreadcrumbsProps) {
  return (
    <nav
      data-slot="breadcrumbs"
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-1.5 text-sm text-foreground-muted',
        className
      )}
      {...properties}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        const content: ReactNode = (
          <span className="inline-flex items-center gap-1.5">
            {item.icon && <Icon name={item.icon} size={16} />}
            {item.label}
          </span>
        );

        return (
          <span key={index} className="inline-flex items-center gap-1.5">
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {content}
              </span>
            ) : (
              <a
                href={item.href ?? '#'}
                className="hover:text-foreground transition-colors"
              >
                {content}
              </a>
            )}
            {!isLast && (
              <Icon
                name="ChevronRight"
                size={14}
                className="shrink-0"
                aria-hidden="true"
              />
            )}
          </span>
        );
      })}
    </nav>
  );
}

export { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem };
