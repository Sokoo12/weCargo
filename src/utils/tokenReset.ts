/**
 * Utility functions for token reset and validation
 */

/**
 * Checks if the stored user token is valid
 */
export function checkStoredUserValidity(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) return false;
    
    // Try to parse user data
    try {
      const parsedUser = JSON.parse(userData);
      
      // Check if user ID has a valid MongoDB ObjectId format (24 hex characters)
      if (!parsedUser.id || typeof parsedUser.id !== 'string' || !parsedUser.id.match(/^[0-9a-fA-F]{24}$/)) {
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Error parsing user data during validation:', e);
      return false;
    }
  } catch (error) {
    console.error('Error validating stored user:', error);
    return false;
  }
}

/**
 * Force a complete reset of auth state
 */
export function forceAuthReset(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear all auth-related localStorage items
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    
    // You could add more items to clear here if needed
    
    // Restore original fetch if it was overridden
    if (window.originalFetch) {
      window.fetch = window.originalFetch;
    }
    
    // Redirect to profile with force reset parameter
    window.location.href = '/profile?forceReset=true';
  } catch (error) {
    console.error('Error during auth reset:', error);
    throw error;
  }
} 