'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export const useDecodedSearchParameters = (key: string) => {
  const searchParameters = useSearchParams();

  // Use the standard method which automatically decodes values
  const value = searchParameters.get(key);
  return value;
};

export const useSearchParameters = (key: string) => {
  const searchParameters = useSearchParams();

  // For Google auth codes and other sensitive parameters, we need to preserve URL encoding
  // The standard searchParams.get() automatically decodes values, which can break auth codes
  if (typeof window !== 'undefined') {
    const searchString = window.location.search;
    // Manually parse the search string to preserve encoding using regex
    const regex = new RegExp(`[?&]${key}=([^&#]*)`);
    const match = searchString.match(regex);
    return match ? match[1] : null;
  }

  // Fallback to the standard method
  const value = searchParameters.get(key);
  return value;
};

export const updateQueryParamameters = (
  router: ReturnType<typeof useRouter>,
  pathname: string,
  currentParameters: URLSearchParams,
  updates: Record<string, string | null>
) => {
  const parameters = new URLSearchParams([...currentParameters.entries()]);

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '') {
      parameters.delete(key);
    } else {
      parameters.set(key, value);
    }
  }

  const search = parameters.toString();
  const query = search ? `?${search}` : '';

  router.push(`${pathname}${query}`, { scroll: false });
};
