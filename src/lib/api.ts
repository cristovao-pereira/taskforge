import { auth } from './firebase';

/**
 * API Client Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get the current user's ID token
 */
async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const idToken = await getIdToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if user is authenticated
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * API Helper Methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Agent-specific API helpers
 * These maintain userId isolation and strategic context
 */
export const agentAPI = {
  /**
   * Retrieve documents relevant to agent analysis
   */
  retrieve: async (query: string, mode: string = 'equilibrado', documentIds: string[] = [], topK: number = 5) =>
    api.post('/api/agents/retrieve', { query, mode, documentIds, topK }),

  /**
   * DecisionForge: Analyze decision with document context
   */
  analyzeDecision: async (decision: string, context: any = {}, documentIds: string[] = []) =>
    api.post('/api/agents/decision', { decision, context, documentIds }),

  /**
   * ClarityForge: Structure thinking with document context
   */
  clarifyThinking: async (input: string, context: any = {}, documentIds: string[] = []) =>
    api.post('/api/agents/clarity', { input, context, documentIds }),

  /**
   * LeverageForge: Identify high-impact actions
   */
  planExecution: async (objective: string, context: any = {}, documentIds: string[] = []) =>
    api.post('/api/agents/leverage', { objective, context, documentIds }),
};

export default api;
