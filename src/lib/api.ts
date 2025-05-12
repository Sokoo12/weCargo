/**
 * API utility functions for the application
 */

/**
 * Gets the base URL for API requests based on environment
 */
export function getApiBaseUrl() {
  // If we're in a browser environment, use the current window's origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // In server environment, use environment variable or default localhost
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
}

/**
 * Builds a complete API URL from a path
 * @param path - The API path, should start with a slash
 */
export function getApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
}

/**
 * Fetches data from the API with error handling
 * @param path - API path
 * @param options - Fetch options
 */
export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = getApiUrl(path);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
} 