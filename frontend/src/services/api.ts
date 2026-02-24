const API_BASE_URL =
  typeof window !== 'undefined'
    ? ((import.meta as any).env?.VITE_API_URL ?? '/api')
    : 'http://localhost:3000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (response.status === 403) {
      const error = await response.json().catch(() => ({ 
        message: 'Acesso negado',
        detail: 'Você não tem permissão para realizar esta ação.' 
      }));
      
      const errorMessage = error.detail || error.message || 'Você não tem permissão para realizar esta ação.';
      const detailedError = new Error(errorMessage);
      (detailedError as any).statusCode = 403;
      (detailedError as any).detail = error.detail;
      throw detailedError;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    // Add timestamp to prevent caching
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${this.baseURL}${endpoint}${separator}_t=${Date.now()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      cache: 'no-store',
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
