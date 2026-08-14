'use client';

import { cn } from '@healthalst/ui/lib/utils';
import { Skeleton } from '@healthalst/ui/components/skeleton';
import { useState } from 'react';

interface BlurImageProps extends React.ComponentProps<'img'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

function BlurImage({
  src,
  alt,
  className,
  width,
  height,
  ...properties
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      data-slot="blur-image"
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {!loaded && (
        <Skeleton className="absolute inset-0 size-full rounded-none" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          'size-full object-cover transition-opacity duration-(--motion-normal)',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        {...properties}
      />
    </div>
  );
}

export { BlurImage, type BlurImageProps };
