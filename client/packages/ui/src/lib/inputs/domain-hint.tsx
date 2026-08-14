import { cn } from '../utils';
import { Icon } from '../utils/icons/icon';

interface CompanyDomainHintProps {
  className?: string;
}

export function CompanyDomainHint({ className }: CompanyDomainHintProps) {
  return (
    <div className={cn('flex items-start gap-1.5 mt-1', className)}>
      <Icon
        name="InfoIcon"
        size={14}
        className="text-foreground-muted shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <p className="text-xs text-foreground-muted italic">
        Used to identify your organization and help verify employee emails (e.g.
        www.techstudiohr.com).
      </p>
    </div>
  );
}

export type { CompanyDomainHintProps };
