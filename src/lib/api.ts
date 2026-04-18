const API_BASE = 'https://app.tablecrm.com/api/v1';

function getToken(): string | null {
  return localStorage.getItem('tablecrm_token')?.trim() || null;
}

export const api = {
  get: async <T>(endpoint: string, params?: Record<string, string>): Promise<T[]> => {
    const token = getToken();
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint : endpoint + '/';
    
    const url = new URL(`${API_BASE}${cleanEndpoint}`);
    url.searchParams.set('token', token || '');
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    const data = await response.json();
    
    if (data && typeof data === 'object' && 'result' in data && Array.isArray(data.result)) {
      return data.result as T[];
    }
    
    if (Array.isArray(data)) {
      return data as T[];
    }
    
    return [];
  },
  
  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const token = getToken();
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint : endpoint + '/';
    const url = `${API_BASE}${cleanEndpoint}?token=${token}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    const text = await response.text();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    return JSON.parse(text) as T;
  },
};