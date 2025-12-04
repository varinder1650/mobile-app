// utils/index.ts - CONSOLIDATED UTILITIES
// Export all utilities from a single entry point

import { IMAGE_BASE_URL } from '../config/apiConfig';

const DEBUG = __DEV__;

// ============================================
// 📅 DATE UTILITIES (Consolidated from multiple files)
// ============================================

export class DateUtils {
  /**
   * Format date to Indian locale
   */
  static formatDate(dateString: string | Date): string {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      });
    } catch (error) {
      if (DEBUG) console.error('Date format error:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Format relative time (e.g., "2h ago")
   */
  static formatRelativeTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMins = Math.floor(diffInMs / 60000);
      const diffInHours = Math.floor(diffInMs / 3600000);
      const diffInDays = Math.floor(diffInMs / 86400000);

      if (diffInMins < 1) return 'Just now';
      if (diffInMins < 60) return `${diffInMins}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Parse IST timestamp properly
   */
  static parseISTTimestamp(dateString: string | Date): number {
    try {
      let date: Date;
      if (typeof dateString === 'string') {
        if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-')) {
          date = new Date(`${dateString}+05:30`);
        } else {
          date = new Date(dateString);
        }
      } else {
        date = dateString;
      }
      return date.getTime();
    } catch (error) {
      if (DEBUG) console.error('❌ Error parsing timestamp:', error);
      return Date.now();
    }
  }

  /**
   * Check if date is today
   */
  static isToday(dateString: string): boolean {
    try {
      const date = new Date(dateString);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  }
}

// ============================================
// 🖼️ IMAGE UTILITIES (Consolidated)
// ============================================

interface ProductImage {
  url?: string;
  secure_url?: string;
  thumbnail?: string;
  public_id?: string;
}

export class ImageUtils {
  private static readonly PLACEHOLDER = 'https://via.placeholder.com/400x300?text=No+Image';

  /**
   * Get single image URL from product images array
   */
  static getImageUrl(images: (string | ProductImage)[]): string {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return this.PLACEHOLDER;
    }
    
    const firstImage = images[0];
    
    if (typeof firstImage === 'string') {
      return firstImage.startsWith('http') ? firstImage : `${IMAGE_BASE_URL}${firstImage}`;
    }
    
    if (typeof firstImage === 'object' && firstImage !== null) {
      const url = firstImage.url || firstImage.secure_url || firstImage.thumbnail;
      if (url) return url;
    }
    
    return this.PLACEHOLDER;
  }

  /**
   * Get all image URLs from product images array
   */
  static getAllImageUrls(images: (string | ProductImage)[]): string[] {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return [this.PLACEHOLDER];
    }
    
    return images.map(img => {
      if (typeof img === 'string') {
        return img.startsWith('http') ? img : `${IMAGE_BASE_URL}${img}`;
      }
      
      if (typeof img === 'object' && img !== null) {
        const url = img.url || img.secure_url || img.thumbnail;
        if (url) return url;
      }
      
      return this.PLACEHOLDER;
    });
  }

  /**
   * Get optimized image URL (for thumbnails)
   */
  static getThumbnailUrl(images: (string | ProductImage)[]): string {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return this.PLACEHOLDER;
    }
    
    const firstImage = images[0];
    
    if (typeof firstImage === 'object' && firstImage !== null && firstImage.thumbnail) {
      return firstImage.thumbnail;
    }
    
    return this.getImageUrl(images);
  }
}

// ============================================
// 💰 PRICE UTILITIES
// ============================================

export class PriceUtils {
  /**
   * Format price in Indian Rupees
   */
  static formatPrice(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  /**
   * Calculate discount percentage
   */
  static calculateDiscountPercentage(original: number, discounted: number): number {
    if (original <= 0) return 0;
    return Math.round(((original - discounted) / original) * 100);
  }

  /**
   * Format large numbers (e.g., 1000 -> 1K)
   */
  static formatCompactNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }
}

// ============================================
// 🎨 STATUS UTILITIES
// ============================================

export class StatusUtils {
  static readonly ORDER_STATUS_COLORS = {
    'pending': '#FF9500',
    'confirmed': '#007AFF',
    'preparing': '#5856D6',
    'assigning': '#FF9500',
    'assigned': '#007AFF',
    'out_for_delivery': '#FF2D92',
    'delivered': '#34C759',
    'cancelled': '#FF3B30',
    'arrived': '#34C759',
  } as const;

  static readonly SUPPORT_STATUS_COLORS = {
    'open': '#FF9500',
    'in_progress': '#007AFF',
    'resolved': '#34C759',
    'closed': '#8E8E93',
  } as const;

  static getOrderStatusColor(status: string): string {
    return this.ORDER_STATUS_COLORS[status as keyof typeof this.ORDER_STATUS_COLORS] || '#8E8E93';
  }

  static getSupportStatusColor(status: string): string {
    return this.SUPPORT_STATUS_COLORS[status as keyof typeof this.SUPPORT_STATUS_COLORS] || '#8E8E93';
  }

  static formatStatusText(status: string): string {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// ============================================
// 📱 PHONE UTILITIES
// ============================================

export class PhoneUtils {
  /**
   * Format phone number for display
   */
  static formatPhoneDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    if (cleaned.length === 12) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
    }
    
    return phone;
  }

  /**
   * Format phone for API (add +91 country code)
   */
  static formatPhoneForAPI(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  /**
   * Validate Indian phone number
   */
  static isValidIndianPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return /^[6-9]\d{9}$/.test(cleaned);
    }
    
    if (cleaned.length === 12) {
      return /^91[6-9]\d{9}$/.test(cleaned);
    }
    
    return false;
  }
}

// ============================================
// 🔍 SEARCH UTILITIES
// ============================================

export class SearchUtils {
  /**
   * Debounce function for search input
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Highlight search terms in text
   */
  static highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '**$1**');
  }

  /**
   * Normalize search query
   */
  static normalizeSearchQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }
}

// ============================================
// 📊 PERFORMANCE UTILITIES
// ============================================

export class PerformanceUtils {
  private static metrics: { [key: string]: number } = {};

  /**
   * Start performance measurement
   */
  static startMeasure(label: string): void {
    if (!DEBUG) return;
    this.metrics[label] = Date.now();
  }

  /**
   * End performance measurement and log
   */
  static endMeasure(label: string): number {
    if (!DEBUG) return 0;
    
    const startTime = this.metrics[label];
    if (!startTime) {
      console.warn(`⚠️ No start time found for: ${label}`);
      return 0;
    }
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ ${label}: ${duration}ms`);
    delete this.metrics[label];
    
    return duration;
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// ============================================
// 🎯 EXPORTS
// ============================================

export * from './sanitization';
export * from './validation';
export * from './secureStorage';
export * from './authenticatedFetch';
export * from './mapUtils';
export * from './whatsappUtils';