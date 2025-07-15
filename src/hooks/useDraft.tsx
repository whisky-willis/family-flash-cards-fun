import { useState, useEffect, useCallback } from 'react';
import { FamilyCard } from '@/pages/CreateCards';

const DRAFT_KEY = 'kindred-cards-draft';

export interface DraftData {
  cards: FamilyCard[];
  deckDesign?: {
    recipientName: string;
    theme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
    font?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
  };
}

export const useDraft = () => {
  const [draft, setDraft] = useState<DraftData>({ cards: [] });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        // Handle legacy format (just array of cards)
        if (Array.isArray(parsedDraft)) {
          setDraft({ cards: parsedDraft });
        } else {
          setDraft(parsedDraft);
        }
      } catch (error) {
        console.error('Failed to parse draft from localStorage:', error);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraftToLocal = useCallback((cards: FamilyCard[], deckDesign?: DraftData['deckDesign']) => {
    console.log('💾 useDraft: saveDraftToLocal called with:', { cards: cards.length, deckDesign });
    
    const draftData: DraftData = { 
      cards, 
      deckDesign: deckDesign !== undefined ? deckDesign : draft.deckDesign 
    };
    
    console.log('💾 useDraft: Final draftData:', draftData);
    
    setDraft(draftData);
    
    // Save to localStorage if there are cards OR if deckDesign is provided
    if (cards.length > 0 || deckDesign !== undefined) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        console.log('💾 useDraft: Successfully saved to localStorage');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('⚠️ LocalStorage quota exceeded, skipping draft save');
          localStorage.removeItem(DRAFT_KEY);
        } else {
          console.error('Failed to save draft to localStorage:', error);
        }
      }
    } else {
      console.log('💾 useDraft: Removing from localStorage (no cards and no deckDesign)');
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []); // Remove problematic dependency

  // Get current draft
  const getDraft = useCallback(() => {
    return draft;
  }, [draft]);

  // Clear draft
  const clearDraft = useCallback(() => {
    setDraft({ cards: [] });
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  // Save deck design settings
  const saveDeckDesign = useCallback((deckDesign: DraftData['deckDesign']) => {
    const draftData: DraftData = { 
      cards: draft.cards, 
      deckDesign 
    };
    setDraft(draftData);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.error('Failed to save deck design:', error);
    }
  }, [draft.cards]);

  // Check if draft exists
  const hasDraft = draft.cards.length > 0;

  return {
    draft,
    saveDraftToLocal,
    getDraft,
    clearDraft,
    saveDeckDesign,
    hasDraft
  };
};