/* eslint-disable react-hooks/set-state-in-effect */
import * as React from 'react';
import { useCallbackRef } from './use-callback-reference';

export type UseIntersectionObserverOptions = IntersectionObserverInit & {
  disabled?: boolean;
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
  fallbackInView?: boolean;
  onChange?: (entry: IntersectionObserverEntry) => void;
};

type UseIntersectionObserverReturn = {
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
};

export function useIntersectionObserver<TElement extends Element>(
  elementReference: React.RefObject<TElement | null>,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    disabled = false,
    freezeOnceVisible = false,
    initialIsIntersecting = false,
    fallbackInView = true,
    onChange,
    root = null,
    rootMargin,
    threshold,
  } = options;

  const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(
    null
  );
  const [isIntersecting, setIsIntersecting] = React.useState(
    initialIsIntersecting
  );
  const handleChange = useCallbackRef(onChange);

  React.useEffect(() => {
    const element = elementReference.current;
    const canFreeze = freezeOnceVisible && isIntersecting;

    if (!element || disabled || canFreeze) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(fallbackInView);
      return;
    }

    const observer = new IntersectionObserver(
      ([nextEntry]) => {
        if (!nextEntry) {
          return;
        }

        setEntry(nextEntry);
        setIsIntersecting(nextEntry.isIntersecting);
        handleChange?.(nextEntry);
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    disabled,
    elementReference,
    fallbackInView,
    freezeOnceVisible,
    handleChange,
    isIntersecting,
    root,
    rootMargin,
    threshold,
  ]);

  return {
    entry,
    isIntersecting,
  };
}
