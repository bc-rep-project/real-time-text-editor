interface RateLimitRule {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests allowed in the window
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private rules: RateLimitRule;

  constructor(rules: RateLimitRule) {
    this.rules = rules;
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  public try(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      // First request
      this.store.set(key, {
        count: 1,
        resetAt: now + this.rules.windowMs,
      });
      return true;
    }

    if (now > entry.resetAt) {
      // Window expired, reset counter
      this.store.set(key, {
        count: 1,
        resetAt: now + this.rules.windowMs,
      });
      return true;
    }

    if (entry.count >= this.rules.maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment counter
    entry.count++;
    return true;
  }

  public getRemainingRequests(key: string): number {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      return this.rules.maxRequests;
    }

    return Math.max(0, this.rules.maxRequests - entry.count);
  }

  public getResetTime(key: string): number | null {
    const entry = this.store.get(key);
    return entry ? entry.resetAt : null;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// Create rate limiters with different rules
export const apiRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
});

export const wsRateLimiter = new RateLimiter({
  windowMs: 1000, // 1 second
  maxRequests: 50,
});

export const authRateLimiter = new RateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 20,
}); 