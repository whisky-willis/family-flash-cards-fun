import { useState, useEffect } from 'react';

const GUEST_SESSION_KEY = 'kindred-cards-guest-session';

/**
 * Custom hook to manage guest session IDs for non-authenticated users
 * Generates a unique session ID that persists in localStorage
 */
export const useGuestSession = () => {
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  // Generate a unique guest session ID
  const generateGuestSessionId = (): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `guest_${timestamp}_${randomString}`;
  };

  // Initialize guest session on mount
  useEffect(() => {
    const existingSessionId = localStorage.getItem(GUEST_SESSION_KEY);
    
    if (existingSessionId) {
      console.log('🔄 useGuestSession: Using existing guest session:', existingSessionId);
      setGuestSessionId(existingSessionId);
    } else {
      const newSessionId = generateGuestSessionId();
      console.log('🆔 useGuestSession: Generated new guest session:', newSessionId);
      localStorage.setItem(GUEST_SESSION_KEY, newSessionId);
      setGuestSessionId(newSessionId);
    }
  }, []);

  // Clear guest session (called after migration to user account)
  const clearGuestSession = () => {
    console.log('🧹 useGuestSession: Clearing guest session');
    localStorage.removeItem(GUEST_SESSION_KEY);
    setGuestSessionId(null);
  };

  return {
    guestSessionId,
    clearGuestSession
  };
};