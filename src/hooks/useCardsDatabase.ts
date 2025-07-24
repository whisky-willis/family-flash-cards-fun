import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGuestSession } from '@/hooks/useGuestSession';
import { useCardMigration } from '@/hooks/useCardMigration';
import { useToast } from '@/hooks/use-toast';

export interface FamilyCard {
  id: string;
  name: string;
  photo?: string;
  dateOfBirth?: string;
  favoriteColor?: string;
  hobbies?: string;
  funFact?: string;
  relationship?: string;
  imagePosition?: {
    x: number;
    y: number;
    scale: number;
  };
  frontImageUrl?: string;
  backImageUrl?: string;
  printReady?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Custom hook for database-backed card persistence with guest and authenticated user support
 */
export const useCardsDatabase = () => {
  const { user, loading: authLoading } = useAuth();
  const { guestSessionId, clearGuestSession } = useGuestSession();
  const { migrateGuestCards } = useCardMigration();
  const { toast } = useToast();

  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  /**
   * Load cards from database based on authentication state
   */
  const loadCards = useCallback(async (forceRefresh = false) => {
    if (authLoading) return; // Wait for auth to initialize
    
    if (!forceRefresh && hasLoadedInitially) return; // Prevent multiple loads
    
    try {
      setLoading(true);
      console.log('🔄 useCardsDatabase: Loading cards for:', { 
        userId: user?.id, 
        guestSessionId,
        isAuthenticated: !!user 
      });

      let query = supabase.from('cards').select('*').order('created_at', { ascending: false });

      if (user) {
        // Load authenticated user's cards
        query = query.eq('user_id', user.id);
      } else if (guestSessionId) {
        // Load guest session cards
        query = query.eq('guest_session_id', guestSessionId).is('user_id', null);
      } else {
        // No session ID yet, return empty
        setCards([]);
        setLoading(false);
        setHasLoadedInitially(true);
        return;
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ useCardsDatabase: Error loading cards:', error);
        toast({
          title: "Load Error",
          description: "Failed to load your cards. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      const loadedCards: FamilyCard[] = (data || []).map(card => ({
        id: card.id,
        name: card.name,
        photo: card.photo || undefined,
        dateOfBirth: card.date_of_birth || undefined,
        favoriteColor: card.favorite_color || undefined,
        hobbies: card.hobbies || undefined,
        funFact: card.fun_fact || undefined,
        relationship: card.relationship || undefined,
        imagePosition: (card.image_position as any) || { x: 0, y: 0, scale: 1 },
        frontImageUrl: card.front_image_url || undefined,
        backImageUrl: card.back_image_url || undefined,
        printReady: card.print_ready || false,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      }));

      console.log('✅ useCardsDatabase: Loaded cards:', loadedCards.length);
      setCards(loadedCards);
      setHasLoadedInitially(true);
    } catch (error) {
      console.error('❌ useCardsDatabase: Unexpected error loading cards:', error);
      toast({
        title: "Load Error",
        description: "An unexpected error occurred while loading your cards.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, guestSessionId, authLoading, hasLoadedInitially, toast]);

  /**
   * Handle authentication state changes and card migration
   */
  useEffect(() => {
    const handleAuthChange = async () => {
      if (authLoading) return;

      if (user && guestSessionId && hasLoadedInitially) {
        // User just authenticated and we have a guest session - migrate cards
        console.log('🔄 useCardsDatabase: User authenticated, starting card migration');
        
        const cardsMigrated = await migrateGuestCards(guestSessionId, user.id);
        
        if (cardsMigrated > 0) {
          // Clear guest session after successful migration
          clearGuestSession();
        }
        
        // Force reload to get all user cards (including migrated ones)
        setHasLoadedInitially(false);
        await loadCards(true);
      } else {
        // Load cards for current state
        await loadCards();
      }
    };

    handleAuthChange();
  }, [user, guestSessionId, authLoading, migrateGuestCards, clearGuestSession, loadCards]);

  /**
   * Save a new card to the database
   */
  const saveCard = useCallback(async (cardData: Omit<FamilyCard, 'id'>): Promise<string | null> => {
    if (authLoading) return null;

    try {
      setSaving(true);
      console.log('💾 useCardsDatabase: Saving new card:', cardData.name);

      const insertData: any = {
        name: cardData.name,
        photo: cardData.photo || null,
        date_of_birth: cardData.dateOfBirth || null,
        favorite_color: cardData.favoriteColor || null,
        hobbies: cardData.hobbies || null,
        fun_fact: cardData.funFact || null,
        relationship: cardData.relationship || null,
        image_position: cardData.imagePosition || { x: 0, y: 0, scale: 1 },
        front_image_url: cardData.frontImageUrl || null,
        back_image_url: cardData.backImageUrl || null,
        print_ready: cardData.printReady || false
      };

      if (user) {
        insertData.user_id = user.id;
      } else if (guestSessionId) {
        insertData.guest_session_id = guestSessionId;
      } else {
        console.error('❌ useCardsDatabase: No user ID or guest session ID available');
        return null;
      }

      const { data, error } = await supabase
        .from('cards')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ useCardsDatabase: Error saving card:', error);
        toast({
          title: "Save Error",
          description: "Failed to save the card. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      const newCard: FamilyCard = {
        id: data.id,
        name: data.name,
        photo: data.photo || undefined,
        dateOfBirth: data.date_of_birth || undefined,
        favoriteColor: data.favorite_color || undefined,
        hobbies: data.hobbies || undefined,
        funFact: data.fun_fact || undefined,
        relationship: data.relationship || undefined,
        imagePosition: (data.image_position as any) || { x: 0, y: 0, scale: 1 },
        frontImageUrl: data.front_image_url || undefined,
        backImageUrl: data.back_image_url || undefined,
        printReady: data.print_ready || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Add to local state
      setCards(prev => [newCard, ...prev]);
      
      console.log('✅ useCardsDatabase: Card saved successfully:', newCard.id);
      return newCard.id;
    } catch (error) {
      console.error('❌ useCardsDatabase: Unexpected error saving card:', error);
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving the card.",
        variant: "destructive",
      });
      return null;
    } finally {
      setSaving(false);
    }
  }, [user, guestSessionId, authLoading, toast]);

  /**
   * Update an existing card in the database
   */
  const updateCard = useCallback(async (cardId: string, updates: Partial<FamilyCard>): Promise<boolean> => {
    try {
      setSaving(true);
      console.log('🔄 useCardsDatabase: Updating card:', cardId);

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.photo !== undefined) updateData.photo = updates.photo;
      if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth;
      if (updates.favoriteColor !== undefined) updateData.favorite_color = updates.favoriteColor;
      if (updates.hobbies !== undefined) updateData.hobbies = updates.hobbies;
      if (updates.funFact !== undefined) updateData.fun_fact = updates.funFact;
      if (updates.relationship !== undefined) updateData.relationship = updates.relationship;
      if (updates.imagePosition !== undefined) updateData.image_position = updates.imagePosition;
      if (updates.frontImageUrl !== undefined) updateData.front_image_url = updates.frontImageUrl;
      if (updates.backImageUrl !== undefined) updateData.back_image_url = updates.backImageUrl;
      if (updates.printReady !== undefined) updateData.print_ready = updates.printReady;

      const { error } = await supabase
        .from('cards')
        .update(updateData)
        .eq('id', cardId);

      if (error) {
        console.error('❌ useCardsDatabase: Error updating card:', error);
        toast({
          title: "Update Error",
          description: "Failed to update the card. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      ));

      console.log('✅ useCardsDatabase: Card updated successfully:', cardId);
      return true;
    } catch (error) {
      console.error('❌ useCardsDatabase: Unexpected error updating card:', error);
      toast({
        title: "Update Error",
        description: "An unexpected error occurred while updating the card.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [toast]);

  /**
   * Delete a card from the database
   */
  const deleteCard = useCallback(async (cardId: string): Promise<boolean> => {
    try {
      setSaving(true);
      console.log('🗑️ useCardsDatabase: Deleting card:', cardId);

      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) {
        console.error('❌ useCardsDatabase: Error deleting card:', error);
        toast({
          title: "Delete Error",
          description: "Failed to delete the card. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Remove from local state
      setCards(prev => prev.filter(card => card.id !== cardId));

      console.log('✅ useCardsDatabase: Card deleted successfully:', cardId);
      return true;
    } catch (error) {
      console.error('❌ useCardsDatabase: Unexpected error deleting card:', error);
      toast({
        title: "Delete Error",
        description: "An unexpected error occurred while deleting the card.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [toast]);

  /**
   * Clear all cards (useful for testing)
   */
  const clearCards = useCallback(async (): Promise<boolean> => {
    try {
      setSaving(true);
      console.log('🧹 useCardsDatabase: Clearing all cards');

      let query = supabase.from('cards').delete();

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (guestSessionId) {
        query = query.eq('guest_session_id', guestSessionId);
      } else {
        return false;
      }

      const { error } = await query;

      if (error) {
        console.error('❌ useCardsDatabase: Error clearing cards:', error);
        return false;
      }

      setCards([]);
      console.log('✅ useCardsDatabase: All cards cleared');
      return true;
    } catch (error) {
      console.error('❌ useCardsDatabase: Unexpected error clearing cards:', error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, guestSessionId]);

  return {
    cards,
    loading,
    saving,
    saveCard,
    updateCard,
    deleteCard,
    clearCards,
    refreshCards: () => loadCards(true)
  };
};