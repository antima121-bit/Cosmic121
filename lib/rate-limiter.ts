// Rate limiting utility for API endpoints

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.limits = new Map()
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  // Check if request is allowed
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      }
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment count
    entry.count++
    this.limits.set(identifier, entry)

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }

  // Get current limits for an identifier
  getCurrentLimit(identifier: string): RateLimitEntry | null {
    const entry = this.limits.get(identifier)
    if (!entry) return null

    const now = Date.now()
    if (now > entry.resetTime) {
      this.limits.delete(identifier)
      return null
    }

    return entry
  }

  // Reset rate limits for development
  resetLimits(): void {
    this.limits.clear()
  }
}

// Create rate limiters for different endpoints
// More generous limits for development
const isDevelopment = process.env.NODE_ENV === 'development'

export const scriptRateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || (isDevelopment ? '50' : '10')),
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
)

export const imageRateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || (isDevelopment ? '20' : '5')), // More generous for development
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
)

// Cleanup expired entries every minute
setInterval(() => {
  scriptRateLimiter.cleanup()
  imageRateLimiter.cleanup()
}, 60000)

export default RateLimiter
