/**
 * Helper utilities for authentication
 */

/**
 * Gets the authentication token from localStorage
 * with safeguards against errors and null values
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const token = localStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Creates a headers object with authorization token
 * @returns Headers object with Authorization header if token exists
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Checks if a user is logged in based on token and userData presence
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    return !!(token && userData);
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}

/**
 * Clears authentication data from localStorage
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
} 