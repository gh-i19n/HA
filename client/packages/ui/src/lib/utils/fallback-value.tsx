import type { ReactNode } from "react";

interface FallbackValueProps {
  readonly children: ReactNode;
  readonly isFallback: boolean;
  readonly className?: string;
}

function FallbackValue({
  children,
  className,
  isFallback,
}: FallbackValueProps) {
  if (isFallback) {
    return null;
  }

  return <span className={className}>{children}</span>;
}

export { FallbackValue };
