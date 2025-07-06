// Password validation utility
export interface PasswordStrength {
  score: number; // 0-4 (very weak to very strong)
  feedback: string[];
  isValid: boolean;
}

export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push("Password must be at least 8 characters long");
  } else if (password.length >= 8) {
    score += 1;
  }

  // Character variety checks
  if (!/[a-z]/.test(password)) {
    feedback.push("Include lowercase letters");
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push("Include uppercase letters");
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push("Include numbers");
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push("Include special characters (!@#$%^&*)");
  } else {
    score += 1;
  }

  // Common password patterns
  if (password.toLowerCase().includes('password')) {
    feedback.push("Avoid common words like 'password'");
    score = Math.max(0, score - 1);
  }

  if (/(.)\1{2,}/.test(password)) {
    feedback.push("Avoid repeating characters");
    score = Math.max(0, score - 1);
  }

  if (/12345|abcde|qwerty/i.test(password)) {
    feedback.push("Avoid common sequences");
    score = Math.max(0, score - 1);
  }

  const isValid = score >= 3 && password.length >= 8;

  return {
    score: Math.min(score, 4),
    feedback,
    isValid
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// File validation
export interface FileValidation {
  isValid: boolean;
  error?: string;
}

export function validateImageFile(file: File): FileValidation {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, GIF, and WebP images are allowed'
    };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }

  // Check image dimensions (basic validation)
  return new Promise<FileValidation>((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width > 4000 || img.height > 4000) {
        resolve({
          isValid: false,
          error: 'Image dimensions must be less than 4000x4000 pixels'
        });
      } else {
        resolve({ isValid: true });
      }
    };
    img.onerror = () => {
      resolve({
        isValid: false,
        error: 'Invalid image file'
      });
    };
    img.src = URL.createObjectURL(file);
  }) as any;
}

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = attempts[0];
    const remainingTime = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, remainingTime);
  }
}

// Generic input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: urls
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}