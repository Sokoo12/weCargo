/**
 * Simple logger utility that doesn't log in production unless explicitly set
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Logs a message with the specified level
 * In production, only error logs are shown by default
 */
export function log(message: string, level: LogLevel = 'info', data?: any): void {
  // In production, only log errors by default
  if (process.env.NODE_ENV === 'production' && level !== 'error') {
    // Check if debug mode is enabled
    if (process.env.NEXT_PUBLIC_DEBUG_MODE !== 'true') {
      return;
    }
  }

  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'info':
      console.log(formattedMessage, data ? data : '');
      break;
    case 'warn':
      console.warn(formattedMessage, data ? data : '');
      break;
    case 'error':
      console.error(formattedMessage, data ? data : '');
      break;
    case 'debug':
      console.debug(formattedMessage, data ? data : '');
      break;
  }
}

// Convenience methods
export const logger = {
  info: (message: string, data?: any) => log(message, 'info', data),
  warn: (message: string, data?: any) => log(message, 'warn', data),
  error: (message: string, data?: any) => log(message, 'error', data),
  debug: (message: string, data?: any) => log(message, 'debug', data),
}; 