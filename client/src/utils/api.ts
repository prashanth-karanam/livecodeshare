export function getBackendUrl(): string {
  if (typeof window === 'undefined') return '/';

  // 1. Check URL query param ?server=...
  const params = new URLSearchParams(window.location.search);
  const serverParam = params.get('server');
  if (serverParam) {
    try {
      localStorage.setItem('lcs_backend_url', serverParam);
    } catch (e) {}
    return serverParam;
  }

  // 2. Check localStorage
  try {
    const saved = localStorage.getItem('lcs_backend_url');
    if (saved && window.location.hostname.includes('github.io')) {
      return saved;
    }
  } catch (e) {}

  // 3. If hosted on github.io without custom server, connect to laptop's tunnel
  if (window.location.hostname.includes('github.io')) {
    return 'https://smart-animals-love.loca.lt';
  }

  // 4. Default: self-hosted on same origin
  return '/';
}

export function getApiUrl(endpoint: string): string {
  const base = getBackendUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (base === '/') {
    return cleanEndpoint;
  }
  return `${base.replace(/\/$/, '')}${cleanEndpoint}`;
}
