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
      localStorage.setItem(DRAFT_KEY, JSON.stringify(cards));
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