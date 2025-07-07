import { useState, useEffect, useCallback } from 'react';
import { FamilyCard } from '@/pages/CreateCards';

const DRAFT_KEY = 'kindred-cards-draft';

export const useDraft = () => {
  const [draft, setDraft] = useState<FamilyCard[]>([]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setDraft(parsedDraft);
      } catch (error) {
        console.error('Failed to parse draft from localStorage:', error);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraftToLocal = useCallback((cards: FamilyCard[]) => {
    setDraft(cards);
    if (cards.length > 0) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(cards));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('⚠️ LocalStorage quota exceeded, skipping draft save');
          // Clear existing draft to free up space
          localStorage.removeItem(DRAFT_KEY);
        } else {
          console.error('Failed to save draft to localStorage:', error);
        }
      }
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  // Get current draft
  const getDraft = useCallback(() => {
    return draft;
  }, [draft]);

  // Clear draft
  const clearDraft = useCallback(() => {
    setDraft([]);
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  // Check if draft exists
  const hasDraft = draft.length > 0;

  return {
    draft,
    saveDraftToLocal,
    getDraft,
    clearDraft,
    hasDraft
  };
};