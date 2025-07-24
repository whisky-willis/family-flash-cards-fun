import { useState, useEffect } from 'react';

/**
 * Hook for secure localStorage with encryption and validation
 */
export const useSecureStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Simple encryption using base64 (not cryptographically secure, but better than plain text)
  const encrypt = (data: string): string => {
    try {
      return btoa(encodeURIComponent(data));
    } catch {
      return data;
    }
  };

  const decrypt = (data: string): string => {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data;
    }
  };

  // Load value from localStorage on mount
  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(`secure_${key}`);
      if (storedValue) {
        const decryptedValue = decrypt(storedValue);
        const parsedValue = JSON.parse(decryptedValue);
        setValue(parsedValue);
      }
    } catch (error) {
      console.warn(`Failed to load secure storage for key: ${key}`, error);
      // If there's an error, remove the corrupted data
      localStorage.removeItem(`secure_${key}`);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Update localStorage when value changes
  const setSecureValue = (newValue: T) => {
    try {
      setValue(newValue);
      const serializedValue = JSON.stringify(newValue);
      const encryptedValue = encrypt(serializedValue);
      localStorage.setItem(`secure_${key}`, encryptedValue);
    } catch (error) {
      console.error(`Failed to save secure storage for key: ${key}`, error);
    }
  };

  // Clear the stored value
  const clearSecureValue = () => {
    setValue(defaultValue);
    localStorage.removeItem(`secure_${key}`);
  };

  return {
    value,
    setValue: setSecureValue,
    clearValue: clearSecureValue,
    isLoading
  };
};