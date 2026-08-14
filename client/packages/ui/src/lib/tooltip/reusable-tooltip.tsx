'use client';

import { Tooltip } from '../../components/tooltip';
import { ReactNode } from 'react';
import { cn } from '../utils';

interface ReusableTooltipProperties {
  content: string | ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  disabled?: boolean;
  maxWidth?: string;
}

export const ReusableTooltip = ({
  content,
  children,
  side = 'top',
  align = 'center',
  contentClassName,
  delayDuration = 300,
  disableHoverableContent = false,
  disabled = false,
  maxWidth = 'max-w-xs',
}: ReusableTooltipProperties) => {
  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      content={content}
      side={side}
      align={align}
      className={cn('wrap-break-word', maxWidth, contentClassName)}
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      {children}
    </Tooltip>
  );
};

// Specialized tooltip for truncated text
interface TruncatedTooltipProperties {
  text: string;
  children: ReactNode;
  maxLength?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
  disabled?: boolean;
}

export const TruncatedTooltip = ({
  text,
  children,
  maxLength = 20,
  side = 'top',
  align = 'center',
  contentClassName,
  disabled = false,
}: TruncatedTooltipProperties) => {
  const shouldShowTooltip = text && text.length > maxLength;
  const displayText =
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  return (
    <ReusableTooltip
      content={shouldShowTooltip ? text : undefined}
      side={side}
      align={align}
      contentClassName={contentClassName}
      disabled={disabled || !shouldShowTooltip}
    >
      {children || <span className="truncate">{displayText}</span>}
    </ReusableTooltip>
  );
};

// Tooltip for email addresses
interface EmailTooltipProperties {
  email: string;
  children?: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
  disabled?: boolean;
}

export const EmailTooltip = ({
  email,
  children,
  side = 'top',
  align = 'center',
  contentClassName,
  disabled = false,
}: EmailTooltipProperties) => {
  return (
    <TruncatedTooltip
      text={email}
      maxLength={10}
      side={side}
      align={align}
      contentClassName={contentClassName}
      disabled={disabled}
    >
      {children}
    </TruncatedTooltip>
  );
};

// Tooltip for long names
interface NameTooltipProperties {
  name: string;
  children?: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
  disabled?: boolean;
}

export const NameTooltip = ({
  name,
  children,
  side = 'top',
  align = 'center',
  contentClassName,
  disabled = false,
}: NameTooltipProperties) => {
  return (
    <TruncatedTooltip
      text={name}
      maxLength={15}
      side={side}
      align={align}
      contentClassName={contentClassName}
      disabled={disabled}
    >
      {children}
    </TruncatedTooltip>
  );
};
