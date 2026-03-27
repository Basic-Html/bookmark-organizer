export const extractDomain = (urlString: string): string => {
  const raw = (urlString || '').trim();
  if (!raw) return '';

  // Ensure we have a protocol so URL() doesn't throw for inputs like "example.com"
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(withScheme).hostname;
  } catch {
    return '';
  }
};

export const getFaviconUrl = (urlString: string): string | null => {
  const domain = extractDomain(urlString);
  if (!domain) {
    return null;
  }

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};

export const getFaviconCandidates = (urlString: string): string[] => {
  const domain = extractDomain(urlString);
  if (!domain) return [];

  const url = (urlString || '').trim();
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const encodedUrl = encodeURIComponent(withScheme);

  return [
    // Best coverage: resolves page icons similar to browser behavior
    `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodedUrl}&size=64`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    // Direct fallback (works on some sites)
    `https://${domain}/favicon.ico`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://icon.horse/icon/${domain}`,
  ];
};
