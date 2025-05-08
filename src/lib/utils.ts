import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id The string to validate
 * @returns True if the string is a valid MongoDB ObjectId (24 hex characters)
 */
export function isValidMongoId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Custom error class for API errors with status code
 */
export class ApiError extends Error {
  statusCode: number
  
  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}
