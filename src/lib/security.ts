import DOMPurify from 'dompurify';

// File upload security constants
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TEXT_LENGTH = 1000;
export const MAX_NAME_LENGTH = 100;

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

// File validation
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
}

export const validateImageFile = (file: File): FileValidationResult => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`
    };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
    };
  }

  // Check file name for malicious content
  const sanitizedName = sanitizeInput(file.name);
  if (sanitizedName.length === 0) {
    return {
      isValid: false,
      error: 'Invalid file name.'
    };
  }

  // Additional security checks
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Empty file not allowed.'
    };
  }

  return {
    isValid: true,
    sanitizedName
  };
};

// Form data validation
export const validateFormData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.name && data.name.length > MAX_NAME_LENGTH) {
    errors.push(`Name too long. Maximum ${MAX_NAME_LENGTH} characters.`);
  }

  if (data.hobbies && data.hobbies.length > MAX_TEXT_LENGTH) {
    errors.push(`Hobbies too long. Maximum ${MAX_TEXT_LENGTH} characters.`);
  }

  if (data.funFact && data.funFact.length > MAX_TEXT_LENGTH) {
    errors.push(`Fun fact too long. Maximum ${MAX_TEXT_LENGTH} characters.`);
  }

  if (data.whereTheyLive && data.whereTheyLive.length > MAX_TEXT_LENGTH) {
    errors.push(`Location too long. Maximum ${MAX_TEXT_LENGTH} characters.`);
  }

  if (data.favoriteColor && data.favoriteColor.length > MAX_NAME_LENGTH) {
    errors.push(`Favorite color too long. Maximum ${MAX_NAME_LENGTH} characters.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize card data before storage/display
export const sanitizeCardData = (card: any) => {
  return {
    ...card,
    name: sanitizeInput(card.name || ''),
    whereTheyLive: sanitizeInput(card.whereTheyLive || ''),
    favoriteColor: sanitizeInput(card.favoriteColor || ''),
    hobbies: sanitizeInput(card.hobbies || ''),
    funFact: sanitizeInput(card.funFact || ''),
  };
};

// Password strength validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting for client-side
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  getRemainingTime(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }
}

export const authRateLimiter = new RateLimiter();

// Secure error handling
export const sanitizeError = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  
  const message = error.message || error.toString();
  
  // Don't expose sensitive information
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /key/i,
    /secret/i,
    /credential/i,
    /auth/i,
    /sql/i,
    /database/i
  ];
  
  if (sensitivePatterns.some(pattern => pattern.test(message))) {
    return 'Authentication error occurred';
  }
  
  // Return sanitized message
  return sanitizeInput(message) || 'An error occurred';
};