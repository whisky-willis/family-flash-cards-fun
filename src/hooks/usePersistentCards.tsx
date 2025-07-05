import { useState, useEffect, useCallback } from 'react';
import { FamilyCard } from '@/pages/CreateCards';
import { 
  saveCardsToLocalStorage, 
  loadCardsFromLocalStorage, 
  clearCardsFromLocalStorage,
  hasCardsInLocalStorage,
  getStorageInfo,
  cleanupLocalStorage
} from '@/lib/persistentStorage';

export const usePersistentCards = () => {
  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load cards from localStorage on mount
  useEffect(() => {
    console.log('🔄 usePersistentCards: Loading cards from localStorage...');
    const storedCards = loadCardsFromLocalStorage();
    
    if (storedCards.length > 0) {
      setCards(storedCards);
      console.log('✅ usePersistentCards: Loaded', storedCards.length, 'cards from localStorage');
    } else {
      console.log('📭 usePersistentCards: No cards found in localStorage');
    }
    
    setIsLoaded(true);
  }, []);

  // Auto-save cards to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && cards.length > 0) {
      const success = saveCardsToLocalStorage(cards);
      if (success) {
        setLastSaved(new Date());
        console.log('💾 usePersistentCards: Auto-saved', cards.length, 'cards to localStorage');
      } else {
        // If save failed, try cleanup and retry once
        console.warn('⚠️ usePersistentCards: Auto-save failed, attempting cleanup...');
        const cleanupResult = cleanupLocalStorage();
        
        if (cleanupResult.cleaned) {
          console.log('🧹 usePersistentCards: Cleanup freed', cleanupResult.freedSpace);
          
          // Retry save after cleanup
          const retrySuccess = saveCardsToLocalStorage(cards);
          if (retrySuccess) {
            setLastSaved(new Date());
            console.log('✅ usePersistentCards: Auto-save succeeded after cleanup');
          } else {
            console.error('❌ usePersistentCards: Auto-save still failing after cleanup');
          }
        }
      }
    }
  }, [cards, isLoaded]);

  // Enhanced setCards function with logging
  const updateCards = useCallback((newCards: FamilyCard[] | ((prev: FamilyCard[]) => FamilyCard[])) => {
    if (typeof newCards === 'function') {
      setCards(prev => {
        const updated = newCards(prev);
        console.log('📝 usePersistentCards: Cards updated via function, new count:', updated.length);
        return updated;
      });
    } else {
      console.log('📝 usePersistentCards: Cards set directly, count:', newCards.length);
      setCards(newCards);
    }
  }, []);

  // Clear all cards
  const clearCards = useCallback(() => {
    setCards([]);
    clearCardsFromLocalStorage();
    console.log('🧹 usePersistentCards: Cleared all cards');
  }, []);

  // Get debug info including storage quota
  const getDebugInfo = useCallback(() => {
    const storageInfo = getStorageInfo();
    return {
      inMemory: {
        cardCount: cards.length,
        isLoaded,
        lastSaved: lastSaved?.toISOString()
      },
      localStorage: storageInfo,
      actions: {
        cleanupLocalStorage: () => cleanupLocalStorage()
      }
    };
  }, [cards.length, isLoaded, lastSaved]);

  return {
    // State
    cards,
    isLoaded,
    lastSaved,
    
    // Actions
    updateCards,
    clearCards,
    
    // Utilities
    hasCardsInStorage: hasCardsInLocalStorage,
    getDebugInfo
  };
};