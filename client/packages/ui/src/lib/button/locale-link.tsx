'use client';

import Link, { LinkProps } from 'next/link';
import { forwardRef } from 'react';

interface LocaleLinkProperties extends Omit<LinkProps, 'href'> {
  href: string | LinkProps['href'];
  children: React.ReactNode;
  className?: string;
}

export const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProperties>(
  ({ href, children, ...properties }, reference) => {
    // Handle both string and UrlObject types
    const finalHref = typeof href === 'string' ? href : href.pathname || '/';

    return (
      <Link ref={reference} href={finalHref} {...properties}>
        {children}
      </Link>
    );
  }
);

LocaleLink.displayName = 'LocaleLink';
