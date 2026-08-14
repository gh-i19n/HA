import { cn } from '@healthalst/ui/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@healthalst/ui/components/avatar';
import { formatInitials } from '@healthalst/ui/lib/utils';

interface UserAvatarProfileProps extends React.ComponentProps<'div'> {
  name: string;
  email?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { avatar: 'size-8', text: 'text-xs', icon: 'text-xs' },
  md: { avatar: 'size-10', text: 'text-sm', icon: 'text-sm' },
  lg: { avatar: 'size-12', text: 'text-base', icon: 'text-base' },
} as const;

function UserAvatarProfile({
  name,
  email,
  avatarUrl,
  size = 'md',
  className,
  ...properties
}: UserAvatarProfileProps) {
  const s = sizeMap[size];

  return (
    <div
      data-slot="user-avatar-profile"
      className={cn('flex items-center gap-3', className)}
      {...properties}
    >
      <Avatar className={s.avatar}>
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className={s.icon}>
          {formatInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className={cn('truncate font-medium text-foreground', s.text)}>
          {name}
        </span>
        {email && (
          <span className={cn('truncate text-foreground-muted', s.text)}>
            {email}
          </span>
        )}
      </div>
    </div>
  );
}

export { UserAvatarProfile, type UserAvatarProfileProps };
