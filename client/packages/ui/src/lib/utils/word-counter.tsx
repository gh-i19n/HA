import { cn } from '@healthalst/ui/lib/utils';

interface WordCounterProps extends React.ComponentProps<'span'> {
  current: number;
  max: number;
}

function WordCounter({
  current,
  max,
  className,
  ...properties
}: WordCounterProps) {
  const isOver = current > max;

  return (
    <span
      data-slot="word-counter"
      className={cn(
        'text-xs tabular-nums',
        isOver ? 'text-danger' : 'text-foreground-muted',
        className
      )}
      aria-live="polite"
      {...properties}
    >
      {current}/{max}
    </span>
  );
}

export { WordCounter, type WordCounterProps };
