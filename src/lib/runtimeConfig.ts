const normalizeBaseUrl = (value?: string) => {
  if (!value) return '';
  return value.replace(/\/$/, '');
};

export const getApiBaseUrl = () =>
  normalizeBaseUrl(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_TARGET || '');

export const toApiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl();
  if (!path.startsWith('/')) return path;
  if (!baseUrl) return path;
  return `${baseUrl}${path}`;
};

export const getSocketBaseUrl = () => getApiBaseUrl() || window.location.origin;
