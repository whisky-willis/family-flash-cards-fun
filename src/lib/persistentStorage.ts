import { FamilyCard } from '@/pages/CreateCards';

const STORAGE_KEY = 'kindred-cards-temp-storage';

export interface StoredCardData {
  cards: FamilyCard[];
  timestamp: number;
  version: string;
}

// Save cards to localStorage with metadata and quota handling
export const saveCardsToLocalStorage = (cards: FamilyCard[]): boolean => {
  try {
    const data: StoredCardData = {
      cards,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    const jsonString = JSON.stringify(data);
    
    // Try to save normally first
    try {
      localStorage.setItem(STORAGE_KEY, jsonString);
      console.log('💾 Cards saved to localStorage:', cards.length, 'cards at', new Date().toISOString());
      return true;
    } catch (quotaError) {
      // If quota exceeded, try to free up space
      if (quotaError.name === 'QuotaExceededError' || quotaError.message.includes('quota')) {
        console.warn('⚠️ localStorage quota exceeded, attempting to free space...');
        
        // Clear other localStorage items that aren't our cards
        const keysToKeep = [STORAGE_KEY];
        const allKeys = Object.keys(localStorage);
        
        for (const key of allKeys) {
          if (!keysToKeep.includes(key)) {
            try {
              localStorage.removeItem(key);
              console.log('🧹 Removed localStorage key:', key);
            } catch (removeError) {
              console.warn('⚠️ Could not remove key:', key, removeError);
            }
          }
        }
        
        // Try saving again after cleanup
        try {
          localStorage.setItem(STORAGE_KEY, jsonString);
          console.log('💾 Cards saved after localStorage cleanup:', cards.length, 'cards');
          return true;
        } catch (retryError) {
          console.error('❌ Still cannot save after cleanup:', retryError);
          
          // Last resort: try saving with minimal data structure
          try {
            const minimalData = { cards, timestamp: Date.now() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalData));
            console.log('💾 Cards saved with minimal structure:', cards.length, 'cards');
            return true;
          } catch (minimalError) {
            console.error('❌ Cannot save even minimal data:', minimalError);
            return false;
          }
        }
      } else {
        throw quotaError;
      }
    }
  } catch (error) {
    console.error('❌ Failed to save cards to localStorage:', error);
    return false;
  }
};

// Load cards from localStorage
export const loadCardsFromLocalStorage = (): FamilyCard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: StoredCardData = JSON.parse(stored);
      
      // Validate data structure
      if (data.cards && Array.isArray(data.cards)) {
        console.log('📋 Cards loaded from localStorage:', data.cards.length, 'cards from', new Date(data.timestamp).toISOString());
        return data.cards;
      } else {
        console.warn('⚠️ Invalid card data structure in localStorage');
        clearCardsFromLocalStorage();
      }
    } else {
      console.log('📋 No cards found in localStorage');
    }
  } catch (error) {
    console.error('❌ Failed to load cards from localStorage:', error);
    // Clear corrupted data
    clearCardsFromLocalStorage();
  }
  return [];
};

// Clear cards from localStorage
export const clearCardsFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🧹 Cleared cards from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear cards from localStorage:', error);
  }
};

// Check if cards exist in localStorage
export const hasCardsInLocalStorage = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: StoredCardData = JSON.parse(stored);
      return data.cards && Array.isArray(data.cards) && data.cards.length > 0;
    }
  } catch (error) {
    console.error('❌ Failed to check localStorage for cards:', error);
  }
  return false;
};

// Get storage info for debugging including quota usage
export const getStorageInfo = (): { hasCards: boolean; cardCount: number; timestamp?: number; quotaInfo?: any } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let cardInfo: { hasCards: boolean; cardCount: number; timestamp?: number } = { hasCards: false, cardCount: 0 };
    
    if (stored) {
      const data: StoredCardData = JSON.parse(stored);
      cardInfo = {
        hasCards: data.cards && Array.isArray(data.cards) && data.cards.length > 0,
        cardCount: data.cards ? data.cards.length : 0,
        timestamp: data.timestamp
      };
    }
    
    // Get localStorage usage info
    let quotaInfo = {};
    try {
      // Estimate localStorage usage
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      
      quotaInfo = {
        estimatedUsage: `${(totalSize / 1024).toFixed(2)} KB`,
        totalKeys: Object.keys(localStorage).length,
        ourCardSize: stored ? `${(stored.length / 1024).toFixed(2)} KB` : '0 KB'
      };
    } catch (quotaError) {
      quotaInfo = { error: 'Could not calculate quota usage' };
    }
    
    return { ...cardInfo, quotaInfo };
  } catch (error) {
    console.error('❌ Failed to get storage info:', error);
    return { hasCards: false, cardCount: 0, quotaInfo: { error: error.message } };
  }
};

// Clean up localStorage to free space for our cards
export const cleanupLocalStorage = (): { cleaned: boolean; freedSpace: string; removedKeys: string[] } => {
  try {
    console.log('🧹 Starting localStorage cleanup...');
    
    // Items to preserve (our cards and essential browser data)
    const keysToKeep = [
      STORAGE_KEY,
      'theme', 'language', 'user-preferences',
      // Keep essential auth tokens
      'supabase.auth.token', 'auth-storage-key'
    ];
    
    const allKeys = Object.keys(localStorage);
    const removedKeys: string[] = [];
    let initialSize = 0;
    let finalSize = 0;
    
    // Calculate initial size
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        initialSize += localStorage[key].length + key.length;
      }
    }
    
    // Remove non-essential keys
    for (const key of allKeys) {
      if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
        try {
          localStorage.removeItem(key);
          removedKeys.push(key);
          console.log('🗑️ Removed localStorage key:', key);
        } catch (removeError) {
          console.warn('⚠️ Could not remove key:', key, removeError);
        }
      }
    }
    
    // Calculate final size
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        finalSize += localStorage[key].length + key.length;
      }
    }
    
    const freedBytes = initialSize - finalSize;
    const freedSpace = `${(freedBytes / 1024).toFixed(2)} KB`;
    
    console.log('✅ localStorage cleanup complete. Freed:', freedSpace, 'Removed keys:', removedKeys.length);
    
    return {
      cleaned: true,
      freedSpace,
      removedKeys
    };
  } catch (error) {
    console.error('❌ localStorage cleanup failed:', error);
    return {
      cleaned: false,
      freedSpace: '0 KB',
      removedKeys: []
    };
  }
};
