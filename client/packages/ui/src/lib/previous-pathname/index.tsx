/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function usePreviousPathname() {
  const pathname = usePathname();
  const [previousPathname, setPreviousPathname] = useState<string | null>(null);

  useEffect(() => {
    const previous = sessionStorage.getItem('previousPathname');

    if (previous && previous !== pathname) {
      setPreviousPathname(previous);
    }

    sessionStorage.setItem('previousPathname', pathname);
  }, [pathname]);

  return previousPathname;
}
