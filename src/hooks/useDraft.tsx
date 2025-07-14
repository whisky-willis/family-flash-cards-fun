import { useState, useEffect, useCallback } from 'react';
import { FamilyCard } from '@/pages/CreateCards';

const DRAFT_KEY = 'kindred-cards-draft';

interface DraftData {
  cards: FamilyCard[];
  email: string;
  timestamp: number;
}

export const useDraft = () => {
  const [draft, setDraft] = useState<FamilyCard[]>([]);
  const [draftEmail, setDraftEmail] = useState<string>('');

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        
        // Handle both old format (just cards array) and new format (with email)
        if (Array.isArray(parsedDraft)) {
          // Old format - just cards
          setDraft(parsedDraft);
          setDraftEmail('');
        } else if (parsedDraft.cards && Array.isArray(parsedDraft.cards)) {
          // New format - with email and metadata
          setDraft(parsedDraft.cards);
          setDraftEmail(parsedDraft.email || '');
        }
      } catch (error) {
        console.error('Failed to parse draft from localStorage:', error);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Save draft to localStorage with email association
  const saveDraftToLocal = useCallback((cards: FamilyCard[], email?: string) => {
    setDraft(cards);
    if (email) {
      setDraftEmail(email);
    }
    
    if (cards.length > 0) {
      try {
        const draftData: DraftData = {
          cards,
          email: email || draftEmail,
          timestamp: Date.now()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        console.log('💾 Saved draft cards with email:', email || draftEmail, 'cards:', cards.length);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('⚠️ LocalStorage quota exceeded, skipping draft save');
          localStorage.removeItem(DRAFT_KEY);
        } else {
          console.error('Failed to save draft to localStorage:', error);
        }
      }
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [draftEmail]);

  // Get current draft
  const getDraft = useCallback(() => {
    return draft;
  }, [draft]);

  // Get draft with email validation
  const getDraftForEmail = useCallback((email: string) => {
    console.log('🔍 Checking draft for email:', email, 'stored email:', draftEmail);
    
    // If no email stored in draft, return the cards anyway (backward compatibility)
    if (!draftEmail) {
      console.log('📋 No email stored in draft, returning cards anyway:', draft.length);
      return draft;
    }
    
    // Check if emails match
    if (draftEmail.toLowerCase() === email.toLowerCase()) {
      console.log('✅ Email matches! Returning', draft.length, 'cards');
      return draft;
    } else {
      console.log('❌ Email mismatch. Draft email:', draftEmail, 'Verification email:', email);
      return [];
    }
  }, [draft, draftEmail]);

  // Clear draft
  const clearDraft = useCallback(() => {
    setDraft([]);
    setDraftEmail('');
    localStorage.removeItem(DRAFT_KEY);
    console.log('🗑️ Draft cleared');
  }, []);

  // Check if draft exists
  const hasDraft = draft.length > 0;

  return {
    draft,
    saveDraftToLocal,
    getDraft,
    getDraftForEmail,
    clearDraft,
    hasDraft
  };
};