import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {isApiConfigured, toApiUrl} from './lib/runtimeConfig';

const nativeFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const isLikelyProductionHost =
    window.location.hostname.includes('vercel.app') || !window.location.hostname.includes('localhost');

  if (isLikelyProductionHost && !isApiConfigured()) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return Promise.reject(
        new Error('API não configurada em produção. Defina VITE_API_URL (ou VITE_API_TARGET) na Vercel.'),
      );
    }
  }

  if (typeof input === 'string' && input.startsWith('/api/')) {
    return nativeFetch(toApiUrl(input), init);
  }

  if (input instanceof Request) {
    try {
      const requestUrl = new URL(input.url, window.location.origin);
      if (requestUrl.pathname.startsWith('/api/')) {
        return nativeFetch(new Request(toApiUrl(requestUrl.pathname + requestUrl.search), input), init);
      }
    } catch {
      return nativeFetch(input, init);
    }
  }

  return nativeFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
