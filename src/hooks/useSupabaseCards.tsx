
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FamilyCard } from '@/hooks/useSupabaseCardsStorage';

export const useSupabaseCards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadCardsFromDatabase = async () => {
    if (!user) return;
    
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
      } else {
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
      return false;
    }

    setIsSaving(true);

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
      } else {
        // Create new collection
        const { error } = await supabase
          .from('card_collections')
          .insert({
            user_id: user.id,
            name: 'My Cards',
            description: 'My family card collection',
            cards: cardsToSave as any
          });

        if (error) throw error;
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

  const migrateDraftToAuthenticated = useCallback(async () => {
    try {
      const draftData = localStorage.getItem('kindred-cards-draft');
      
      if (draftData && user && cards.length === 0) {
        const draftCards = JSON.parse(draftData) as FamilyCard[];
        
        if (draftCards.length > 0) {
          const success = await saveCardsToDatabase(draftCards);
          if (success) {
            setCards(draftCards);
            localStorage.removeItem('kindred-cards-draft');
            toast({
              title: "Cards Saved!",
              description: `Successfully saved ${draftCards.length} cards to your account.`,
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to migrate draft cards:', error);
    }
  }, [user, toast, cards.length]);

  // Load cards when user is available
  useEffect(() => {
    if (user) {
      loadCardsFromDatabase();
    } else {
      setIsLoaded(true);
    }
  }, [user]);

  // Handle draft migration for authenticated users
  useEffect(() => {
    if (user && isLoaded && cards.length === 0) {
      migrateDraftToAuthenticated();
    }
  }, [user, isLoaded, cards.length, migrateDraftToAuthenticated]);

  const updateCards = useCallback(async (newCards: FamilyCard[]) => {
    setCards(newCards);
    
    // Auto-save to database if user is authenticated
    if (isLoaded && user) {
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
    
    return cardWithId;
  }, [cards, updateCards]);

  const updateCard = useCallback(async (cardId: string, updatedCard: Omit<FamilyCard, 'id'>) => {
    const updatedCards = cards.map(card => 
      card.id === cardId 
        ? { ...updatedCard, id: cardId }
        : card
    );
    
    await updateCards(updatedCards);
    
  }, [cards, updateCards]);

  const removeCard = useCallback(async (cardId: string) => {
    const updatedCards = cards.filter(card => card.id !== cardId);
    await updateCards(updatedCards);
    
  }, [cards, updateCards]);

  const clearCards = useCallback(async () => {
    await updateCards([]);
    
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
