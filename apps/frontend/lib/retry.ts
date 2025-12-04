/**
 * Retry utility with exponential backoff for API calls.
 */

export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: any
  attempts: number
}

/**
 * Retry a function with exponential backoff.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options

  let lastError: any
  let delay = initialDelay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await fn()
      return {
        success: true,
        data,
        attempts: attempt,
      }
    } catch (error: any) {
      lastError = error

      // Don't retry on certain errors
      if (error.status === 400 || error.status === 401 || error.status === 403) {
        return {
          success: false,
          error,
          attempts: attempt,
        }
      }

      // If this was the last attempt, return error
      if (attempt === maxAttempts) {
        return {
          success: false,
          error,
          attempts: attempt,
        }
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * backoffMultiplier, maxDelay)
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: maxAttempts,
  }
}

/**
 * Categorize errors for user-friendly messages.
 */
export function categorizeError(error: any): { message: string; retryable: boolean } {
  if (!error) {
    return { message: 'An unknown error occurred', retryable: true }
  }

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return {
      message: 'Network error. Please check your connection and try again.',
      retryable: true,
    }
  }

  // HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return { message: 'Invalid request. Please check your input.', retryable: false }
      case 401:
        return { message: 'Authentication required. Please sign in.', retryable: false }
      case 403:
        return { message: 'Access denied. You don\'t have permission.', retryable: false }
      case 404:
        return { message: 'Resource not found.', retryable: false }
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          retryable: true,
        }
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'Server error. Please try again in a moment.',
          retryable: true,
        }
      default:
        return {
          message: error.message || `Error ${error.status}: ${error.statusText || 'Unknown error'}`,
          retryable: error.status >= 500,
        }
    }
  }

  // Error message
  if (error.message) {
    return {
      message: error.message,
      retryable: true,
    }
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    retryable: true,
  }
}

/**
 * Log errors for debugging.
 */
export function logError(context: string, error: any) {
  console.error(`[${context}] Error:`, {
    message: error.message,
    status: error.status,
    statusText: error.statusText,
    error,
  })
}
