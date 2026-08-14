'use client';
import { Star } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../utils';
import { MainButton } from '../button';

interface RatingsProperties {
  rating: number;
  size?: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

/**
 * A row of 5 star buttons for showing or picking a rating. In `readonly`
 * mode it's purely a display (stars are disabled, no hover preview). In
 * interactive mode, hovering previews what the rating would become and
 * clicking commits it — falling back to internal state if the caller
 * doesn't control `rating` via `onChange`.
 */
export const Ratings: React.FC<RatingsProperties> = ({
  rating,
  size = 20,
  readonly = true,
  onChange,
  className = '',
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [internalRating, setInternalRating] = useState<number>(rating);

  // If controlled, use prop; if uncontrolled, use internal state
  const displayRating = readonly
    ? rating
    : hovered === null
      ? internalRating
      : hovered;

  const handleClick = (index: number) => {
    if (readonly) return;
    setInternalRating(index + 1);
    onChange?.(index + 1);
  };

  const handleMouseEnter = (index: number) => {
    if (readonly) return;
    setHovered(index + 1);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHovered(null);
  };

  return (
    <div className={cn('flex gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <MainButton
          key={index}
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={readonly ? -1 : 0}
          ariaLabel={`Rate ${index + 1} star${index === 0 ? '' : 's'}`}
          isDisabled={readonly}
          onClick={() => handleClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onFocus={() => handleMouseEnter(index)}
          onBlur={handleMouseLeave}
          className={cn(
            'h-auto w-auto p-0 shadow-none transition-colors hover:bg-transparent focus:outline-none',
            readonly && 'cursor-default',
            !readonly && 'cursor-pointer'
          )}
        >
          <Star
            size={size}
            className={cn(
              index < displayRating
                ? 'fill-warning text-warning'
                : 'fill-foreground-muted text-foreground-muted'
            )}
          />
        </MainButton>
      ))}
    </div>
  );
};
