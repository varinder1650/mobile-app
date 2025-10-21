// utils/sanitization.ts - Enhanced security utilities

export interface SanitizationResult {
    safe: boolean;
    sanitized: string;
    threats: string[];
  }
  
  const XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /on\w+\s*=\s*["']?[^"'>]*["']?/gi,
    /javascript\s*:/gi,
    /<(object|embed|applet|meta|link|style)/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /<img[^>]+src[^>]*>/gi,
  ];
  
  const SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\bOR\b|\bAND\b).*?[=<>]/i,
    /(\bunion\b|\bselect\b).*?(\bfrom\b)/i,
  ];
  
  export class SecuritySanitizer {
    /**
     * Sanitize user-generated text content for display
     * Prevents XSS and injection attacks
     */
    static sanitizeText(input: string | null | undefined): SanitizationResult {
      if (!input) {
        return { safe: true, sanitized: '', threats: [] };
      }
  
      const threats: string[] = [];
      let sanitized = String(input);
  
      // Remove null bytes and control characters
      sanitized = sanitized
        .replace(/\0/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
      // Check for XSS
      XSS_PATTERNS.forEach(pattern => {
        if (pattern.test(sanitized)) {
          threats.push('XSS_DETECTED');
          sanitized = sanitized.replace(pattern, '');
        }
      });
  
      // Check for SQL injection
      SQL_INJECTION_PATTERNS.forEach(pattern => {
        if (pattern.test(sanitized)) {
          threats.push('SQL_INJECTION_DETECTED');
        }
      });
  
      // Remove dangerous patterns but DON'T encode HTML entities
      // React Native Text doesn't decode &lt; etc.
      sanitized = sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*["']?[^"'>]*["']?/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/<(object|embed|applet|meta|link|style|svg)/gi, '');
  
      // Limit length to prevent DoS
      if (sanitized.length > 10000) {
        sanitized = sanitized.substring(0, 10000);
        threats.push('LENGTH_EXCEEDED');
      }
  
      return {
        safe: threats.length === 0,
        sanitized: sanitized.trim(),
        threats,
      };
    }
  
    /**
     * Sanitize and validate numeric input (prices, quantities, tips)
     */
    static sanitizeNumber(
      input: string | number,
      min: number = 0,
      max: number = Number.MAX_SAFE_INTEGER
    ): { isValid: boolean; value: number; error?: string } {
      const num = typeof input === 'string' ? parseFloat(input.replace(/[^\d.-]/g, '')) : input;
  
      if (isNaN(num)) {
        return { isValid: false, value: 0, error: 'Invalid number' };
      }
  
      if (num < min) {
        return { isValid: false, value: num, error: `Minimum value is ${min}` };
      }
  
      if (num > max) {
        return { isValid: false, value: num, error: `Maximum value is ${max}` };
      }
  
      return { isValid: true, value: num };
    }
  
    /**
     * Sanitize URLs to prevent open redirect attacks
     */
    static sanitizeUrl(url: string): { safe: boolean; sanitized: string } {
      if (!url) {
        return { safe: true, sanitized: '' };
      }
  
      // Only allow http/https protocols
      const allowedProtocols = ['http:', 'https:'];
      
      try {
        const parsed = new URL(url);
        
        if (!allowedProtocols.includes(parsed.protocol)) {
          return { safe: false, sanitized: '' };
        }
  
        // Check for javascript: protocol in any part
        if (url.toLowerCase().includes('javascript:')) {
          return { safe: false, sanitized: '' };
        }
  
        return { safe: true, sanitized: url };
      } catch (error) {
        // Invalid URL
        return { safe: false, sanitized: '' };
      }
    }
  
    /**
     * Sanitize file upload names
     */
    static sanitizeFileName(fileName: string): string {
      if (!fileName) return '';
  
      return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 255);
    }
  
    /**
     * Rate limiting helper - track API calls
     */
    static createRateLimiter(maxCalls: number, windowMs: number) {
      const calls: number[] = [];
  
      return {
        isAllowed: (): boolean => {
          const now = Date.now();
          const windowStart = now - windowMs;
  
          // Remove old calls
          while (calls.length > 0 && calls[0] < windowStart) {
            calls.shift();
          }
  
          if (calls.length >= maxCalls) {
            return false;
          }
  
          calls.push(now);
          return true;
        },
        getRemainingCalls: (): number => {
          const now = Date.now();
          const windowStart = now - windowMs;
          
          const activeCalls = calls.filter(time => time >= windowStart);
          return Math.max(0, maxCalls - activeCalls.length);
        },
      };
    }
  
    /**
     * Detect potential phishing/malicious content
     */
    static detectMaliciousContent(text: string): { isSafe: boolean; reasons: string[] } {
      const reasons: string[] = [];
      const lower = text.toLowerCase();
  
      const suspiciousPatterns = [
        { pattern: /(verify|confirm|update).*account/i, reason: 'Phishing attempt' },
        { pattern: /click.*link.*urgent/i, reason: 'Suspicious urgency' },
        { pattern: /password.*expire/i, reason: 'Password scam' },
        { pattern: /suspended.*account/i, reason: 'Account threat scam' },
        { pattern: /refund.*\d+/i, reason: 'Refund scam' },
      ];
  
      for (const { pattern, reason } of suspiciousPatterns) {
        if (pattern.test(text)) {
          reasons.push(reason);
        }
      }
  
      return {
        isSafe: reasons.length === 0,
        reasons,
      };
    }
  }
  
  /**
   * React hook for sanitized text display
   */
  export const useSanitizedText = (text: string | null | undefined): string => {
    const result = SecuritySanitizer.sanitizeText(text);
    
    if (!result.safe && __DEV__) {
      console.warn('⚠️ Security threats detected:', result.threats);
    }
    
    return result.sanitized;
  };