import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { FamilyCard } from './useSupabaseCardsStorage';
import { DraftData } from './useDraft';

// Special name for the auto-saved active draft
const ACTIVE_DRAFT_NAME = '__active_draft__';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export interface AutoSaveState {
  cards: FamilyCard[];
  deckDesign?: DraftData['deckDesign'];
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

interface UseAutoSaveOptions {
  cards: FamilyCard[];
  deckDesign?: DraftData['deckDesign'];
  enabled?: boolean;
}

export const useAutoSave = ({ cards, deckDesign, enabled = true }: UseAutoSaveOptions) => {
  const { user } = useAuth();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoredData, setRestoredData] = useState<AutoSaveState | null>(null);

  // Track previous values to detect changes
  const previousCardsRef = useRef<string>('');
  const previousDeckDesignRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);

  // Serialize for comparison
  const serializeCards = (c: FamilyCard[]) => JSON.stringify(c.map(card => ({
    name: card.name,
    relationship: card.relationship,
    dateOfBirth: card.dateOfBirth,
    favoriteColor: card.favoriteColor,
    hobbies: card.hobbies,
    funFact: card.funFact,
    photo: card.photo,
    imagePosition: card.imagePosition
  })));

  const serializeDeckDesign = (d?: DraftData['deckDesign']) => JSON.stringify(d || {});

  // Save active draft to database
  const saveActiveDraft = useCallback(async (forceCards?: FamilyCard[], forceDeckDesign?: DraftData['deckDesign']) => {
    if (!user || !enabled) return false;

    const cardsToSave = forceCards || cards;
    const designToSave = forceDeckDesign || deckDesign;

    // Don't save if nothing to save
    if (cardsToSave.length === 0 && !designToSave?.recipientName) {
      return false;
    }

    setIsSaving(true);

    try {
      // Check if active draft exists
      const { data: existing } = await supabase
        .from('card_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', ACTIVE_DRAFT_NAME)
        .maybeSingle();

      const draftData = {
        user_id: user.id,
        name: ACTIVE_DRAFT_NAME,
        description: 'Auto-saved work in progress',
        cards: cardsToSave as any,
        deck_design: designToSave as any,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        // Update existing draft
        const { error } = await supabase
          .from('card_collections')
          .update(draftData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new draft
        const { error } = await supabase
          .from('card_collections')
          .insert(draftData);

        if (error) throw error;
      }

      const now = new Date();
      setLastSaved(now);
      setHasUnsavedChanges(false);
      previousCardsRef.current = serializeCards(cardsToSave);
      previousDeckDesignRef.current = serializeDeckDesign(designToSave);

      console.log('Auto-saved draft at', now.toLocaleTimeString());
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, enabled, cards, deckDesign]);

  // Load active draft from database
  const loadActiveDraft = useCallback(async (): Promise<AutoSaveState | null> => {
    if (!user) return null;

    setIsRestoring(true);

    try {
      const { data, error } = await supabase
        .from('card_collections')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', ACTIVE_DRAFT_NAME)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const restored: AutoSaveState = {
          cards: Array.isArray(data.cards) ? data.cards as unknown as FamilyCard[] : [],
          deckDesign: data.deck_design as DraftData['deckDesign'],
          lastSaved: data.updated_at ? new Date(data.updated_at) : null,
          hasUnsavedChanges: false
        };

        setRestoredData(restored);
        previousCardsRef.current = serializeCards(restored.cards);
        previousDeckDesignRef.current = serializeDeckDesign(restored.deckDesign);

        console.log('Restored active draft:', restored.cards.length, 'cards');
        return restored;
      }

      return null;
    } catch (error) {
      console.error('Failed to load active draft:', error);
      return null;
    } finally {
      setIsRestoring(false);
    }
  }, [user]);

  // Clear active draft from database
  const clearActiveDraft = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('card_collections')
        .delete()
        .eq('user_id', user.id)
        .eq('name', ACTIVE_DRAFT_NAME);

      setLastSaved(null);
      setHasUnsavedChanges(false);
      setRestoredData(null);
      previousCardsRef.current = '';
      previousDeckDesignRef.current = '';

      console.log('Cleared active draft');
    } catch (error) {
      console.error('Failed to clear active draft:', error);
    }
  }, [user]);

  // Convert active draft to a named collection
  const saveAsCollection = useCallback(async (name: string) => {
    if (!user || cards.length === 0) return false;

    try {
      // Save as a new named collection
      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          name,
          description: `Collection with ${cards.length} cards`,
          cards: cards as any,
          deck_design: deckDesign as any
        });

      if (error) throw error;

      // Clear the active draft since it's now a named collection
      await clearActiveDraft();

      return true;
    } catch (error) {
      console.error('Failed to save as collection:', error);
      return false;
    }
  }, [user, cards, deckDesign, clearActiveDraft]);

  // Detect changes and mark as unsaved
  useEffect(() => {
    if (!user || !enabled || !initialLoadRef.current) return;

    const currentCards = serializeCards(cards);
    const currentDeckDesign = serializeDeckDesign(deckDesign);

    if (currentCards !== previousCardsRef.current || currentDeckDesign !== previousDeckDesignRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [cards, deckDesign, user, enabled]);

  // Auto-save on interval when there are unsaved changes
  useEffect(() => {
    if (!user || !enabled || !hasUnsavedChanges) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set up new save timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveActiveDraft();
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [user, enabled, hasUnsavedChanges, saveActiveDraft]);

  // Mark initial load as complete after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      initialLoadRef.current = true;
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Save immediately when user is about to leave (before unload)
  useEffect(() => {
    if (!user || !enabled) return;

    const handleBeforeUnload = () => {
      if (hasUnsavedChanges) {
        // Attempt synchronous save via sendBeacon if possible
        // For now, just log - the browser unload is too fast for async
        console.log('User leaving with unsaved changes');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, enabled, hasUnsavedChanges]);

  return {
    lastSaved,
    hasUnsavedChanges,
    isSaving,
    isRestoring,
    restoredData,
    saveActiveDraft,
    loadActiveDraft,
    clearActiveDraft,
    saveAsCollection,
    saveNow: () => saveActiveDraft()
  };
};
