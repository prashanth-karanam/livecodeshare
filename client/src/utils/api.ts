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
    if (saved) {
      return saved;
    }
  } catch (e) {}

  // 3. If hosted on same origin (Laptop server http://localhost:3000 or http://10.3.103.31:3000)
  return '/';
}

export function setBackendUrl(url: string): void {
  try {
    localStorage.setItem('lcs_backend_url', url);
  } catch (e) {}
}

export function getApiUrl(endpoint: string): string {
  const base = getBackendUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (base === '/') {
    return cleanEndpoint;
  }
  return `${base.replace(/\/$/, '')}${cleanEndpoint}`;
}
