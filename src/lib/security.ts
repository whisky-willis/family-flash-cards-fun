/**
 * Security utilities for input validation and sanitization
 */

// XSS protection - escape HTML characters
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Sanitize string inputs
export const sanitizeString = (input: string, maxLength: number = 255): string => {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate file upload
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { valid: true };
};

// Generate secure random string for session IDs
export const generateSecureRandomId = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate card input data
export const validateCardData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (data.relationship && data.relationship.length > 50) {
    errors.push('Relationship must be less than 50 characters');
  }

  if (data.hobbies && data.hobbies.length > 200) {
    errors.push('Hobbies must be less than 200 characters');
  }

  if (data.fun_fact && data.fun_fact.length > 500) {
    errors.push('Fun fact must be less than 500 characters');
  }

  return { valid: errors.length === 0, errors };
};

// Rate limiting utility
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};