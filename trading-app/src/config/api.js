export function apiUrl(path) {
  const base = import.meta.env.VITE_API_BASE || '';
  if (!base) return path;
  return `${base.replace(/\/$/, '')}${path}`;
}

export function wsUrl() {
  const explicit = import.meta.env.VITE_WS_URL;
  if (explicit) return explicit;
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws`;
}
