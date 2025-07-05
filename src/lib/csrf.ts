// Import useState and useEffect for the hook
import { useState, useEffect } from 'react';

// CSRF Protection Utility
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly HEADER_NAME = 'X-CSRF-Token';
  
  // Generate a random CSRF token
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Store token in session storage
  static storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }
  
  // Retrieve token from session storage
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
  
  // Initialize CSRF protection (call on app start)
  static initialize(): string {
    let token = this.getToken();
    if (!token) {
      token = this.generateToken();
      this.storeToken(token);
    }
    return token;
  }
  
  // Validate CSRF token
  static validateToken(providedToken: string): boolean {
    const storedToken = this.getToken();
    return storedToken !== null && storedToken === providedToken;
  }
  
  // Create headers with CSRF token
  static getHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      throw new Error('CSRF token not initialized');
    }
    return {
      [this.HEADER_NAME]: token
    };
  }
  
  // Refresh token (call after successful form submission)
  static refreshToken(): string {
    const newToken = this.generateToken();
    this.storeToken(newToken);
    return newToken;
  }
}

// React hook for CSRF protection
export const useCSRFProtection = () => {
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    const csrfToken = CSRFProtection.initialize();
    setToken(csrfToken);
  }, []);
  
  const refreshToken = () => {
    const newToken = CSRFProtection.refreshToken();
    setToken(newToken);
    return newToken;
  };
  
  return {
    token,
    refreshToken,
    getHeaders: CSRFProtection.getHeaders
  };
};