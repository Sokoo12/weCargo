/**
 * Generates a random numeric code of specified length
 * @param length Length of the code to generate
 * @returns A random numeric code as string
 */
export function generateRandomCode(length: number): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

/**
 * Checks if a reset code is expired
 * @param expiryDate The expiry date to check against
 * @returns True if the code is expired, false otherwise
 */
export function isResetCodeExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  
  const now = new Date();
  return now > expiryDate;
} 