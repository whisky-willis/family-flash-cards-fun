import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FamilyCard } from '@/pages/CreateCards';

export const useSupabaseCards = () => {
  const { user, createAnonymousUser } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize user session and load cards
  useEffect(() => {
    const initializeSession = async () => {
      console.log('🚀 Initializing card session...');
      
      // Only create anonymous user if we're on the create page and no user exists
      if (!user && window.location.pathname === '/create') {
        console.log('👤 No user found, creating anonymous user...');
        const { error } = await createAnonymousUser();
        if (error) {
          console.error('❌ Failed to create anonymous user:', error);
          toast({
            title: "Session Error",
            description: "Failed to initialize session. Please refresh the page.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Load cards from database if user exists
      if (user) {
        await loadCardsFromDatabase();
      } else {
        setIsLoaded(true);
      }
    };

    initializeSession();
  }, [user]);

  const loadCardsFromDatabase = async () => {
    if (!user) return;
    
    console.log('📋 Loading cards from database for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('card_collections')
        .select('cards')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading cards:', error);
        return;
      }

      if (data && data.cards) {
        const loadedCards = Array.isArray(data.cards) ? (data.cards as unknown) as FamilyCard[] : [];
        setCards(loadedCards);
        console.log('✅ Loaded cards from database:', loadedCards.length);
      } else {
        console.log('📭 No existing cards found in database');
        setCards([]);
      }
    } catch (error) {
      console.error('❌ Failed to load cards:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveCardsToDatabase = async (cardsToSave: FamilyCard[]) => {
    if (!user) {
      console.warn('⚠️ No user available for saving cards');
      return false;
    }

    setIsSaving(true);
    console.log('💾 Saving cards to database:', cardsToSave.length);

    try {
      // Check if user already has a collection
      const { data: existingCollection } = await supabase
        .from('card_collections')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingCollection) {
        // Update existing collection
        const { error } = await supabase
          .from('card_collections')
          .update({
            cards: cardsToSave as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCollection.id);

        if (error) throw error;
        console.log('✅ Updated existing collection');
      } else {
        // Create new collection
        const { error } = await supabase
          .from('card_collections')
          .insert({
            user_id: user.id,
            name: user.is_anonymous ? 'Draft Collection' : 'My Cards',
            description: user.is_anonymous ? 'Collection created while browsing' : 'My family card collection',
            cards: cardsToSave as any
          });

        if (error) throw error;
        console.log('✅ Created new collection');
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to save cards:', error);
      toast({
        title: "Save Error",
        description: "Failed to save your cards. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateCards = useCallback(async (newCards: FamilyCard[]) => {
    setCards(newCards);
    
    // Auto-save to database
    if (isLoaded) {
      await saveCardsToDatabase(newCards);
    }
  }, [isLoaded, user]);

  const addCard = useCallback(async (newCard: Omit<FamilyCard, 'id'>) => {
    const cardWithId: FamilyCard = {
      ...newCard,
      id: Date.now().toString(),
    };
    
    const updatedCards = [...cards, cardWithId];
    await updateCards(updatedCards);
    
    console.log('➕ Added card:', newCard.name);
    return cardWithId;
  }, [cards, updateCards]);

  const updateCard = useCallback(async (cardId: string, updatedCard: Omit<FamilyCard, 'id'>) => {
    const updatedCards = cards.map(card => 
      card.id === cardId 
        ? { ...updatedCard, id: cardId }
        : card
    );
    
    await updateCards(updatedCards);
    console.log('✏️ Updated card:', cardId);
  }, [cards, updateCards]);

  const removeCard = useCallback(async (cardId: string) => {
    const updatedCards = cards.filter(card => card.id !== cardId);
    await updateCards(updatedCards);
    console.log('🗑️ Removed card:', cardId);
  }, [cards, updateCards]);

  const clearCards = useCallback(async () => {
    await updateCards([]);
    console.log('🧹 Cleared all cards');
  }, [updateCards]);

  return {
    cards,
    isLoaded,
    isSaving,
    updateCards,
    addCard,
    updateCard,
    removeCard,
    clearCards,
    refreshCards: loadCardsFromDatabase
  };
};