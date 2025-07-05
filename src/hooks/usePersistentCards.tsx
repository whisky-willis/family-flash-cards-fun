import { useState, useEffect } from 'react';
import { FamilyCard } from '@/pages/CreateCards';

const STORAGE_KEY = 'kindred-cards-persistent-v2';

export const usePersistentCards = () => {
  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cards on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const parsedCards = data.cards || data; // Handle both old and new format
        setCards(parsedCards);
        console.log('📋 Loaded cards from persistent storage:', parsedCards.length);
      }
    } catch (error) {
      console.error('❌ Failed to parse stored cards:', error);
      // Try to load from old key as fallback
      try {
        const oldStored = localStorage.getItem('kindred_draft_cards');
        if (oldStored) {
          const oldCards = JSON.parse(oldStored);
          setCards(oldCards);
          console.log('📋 Loaded cards from legacy storage:', oldCards.length);
          // Save to new format
          saveCardsToStorage(oldCards);
          localStorage.removeItem('kindred_draft_cards');
        }
      } catch (oldError) {
        console.error('❌ Failed to load from legacy storage:', oldError);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveCardsToStorage = (cardsToSave: FamilyCard[]) => {
    try {
      const dataToStore = {
        cards: cardsToSave,
        timestamp: Date.now(),
        version: '2.0'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      console.log('💾 Saved cards to persistent storage:', cardsToSave.length);
      return true;
    } catch (error) {
      console.warn('⚠️ localStorage quota exceeded, clearing old data');
      try {
        // Clear old storage keys
        localStorage.removeItem('kindred_draft_cards');
        localStorage.removeItem('kindred-cards-backup');
        // Try again
        const dataToStore = {
          cards: cardsToSave,
          timestamp: Date.now(),
          version: '2.0'
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        console.log('💾 Saved cards after clearing old data');
        return true;
      } catch (secondError) {
        console.error('❌ Failed to save even after clearing:', secondError);
        return false;
      }
    }
  };

  // Update cards with automatic persistence
  const updateCards = (newCards: FamilyCard[]) => {
    setCards(newCards);
    if (isLoaded) {
      saveCardsToStorage(newCards);
    }
  };

  // Clear all stored cards
  const clearCards = () => {
    setCards([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('kindred_draft_cards'); // Clear legacy key too
    console.log('🗑️ Cleared all stored cards');
  };

  return { 
    cards, 
    updateCards, 
    clearCards,
    isLoaded,
    saveCardsToStorage 
  };
};