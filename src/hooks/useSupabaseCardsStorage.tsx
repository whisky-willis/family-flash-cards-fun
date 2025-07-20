import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FamilyCard {
  id: string;
  name: string;
  relationship?: string;
  dateOfBirth?: string;
  favoriteColor?: string;
  hobbies?: string;
  funFact?: string;
  photo_url?: string;
  imagePosition?: {
    x: number;
    y: number;
    scale: number;
  };
}

export const useSupabaseCardsStorage = () => {
  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generate or get session ID for temporary storage
  const getSessionId = () => {
    let sessionId = localStorage.getItem('card_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('card_session_id', sessionId);
    }
    return sessionId;
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const sessionId = getSessionId();
      const fileExt = file.name.split('.').pop();
      const fileName = `${sessionId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('card-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('card-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  // Load cards from database
  const loadCards = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_session_id', sessionId)
        .is('order_id', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Load error:', error);
        toast.error('Failed to load cards');
        return;
      }

      const formattedCards: FamilyCard[] = data.map(card => ({
        id: card.id,
        name: card.name,
        relationship: card.relationship || undefined,
        dateOfBirth: card.date_of_birth || undefined,
        favoriteColor: card.favorite_color || undefined,
        hobbies: card.hobbies || undefined,
        funFact: card.fun_fact || undefined,
        photo_url: card.photo_url || undefined,
        imagePosition: (card.image_position as { x: number; y: number; scale: number }) || { x: 0, y: 0, scale: 1 }
      }));

      setCards(formattedCards);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  // Save card to database
  const saveCard = async (card: Omit<FamilyCard, 'id'>): Promise<string | null> => {
    setSaving(true);
    try {
      const sessionId = getSessionId();
      
      const { data, error } = await supabase
        .from('cards')
        .insert({
          user_session_id: sessionId,
          name: card.name,
          relationship: card.relationship || null,
          date_of_birth: card.dateOfBirth || null,
          favorite_color: card.favoriteColor || null,
          hobbies: card.hobbies || null,
          fun_fact: card.funFact || null,
          photo_url: card.photo_url || null,
          image_position: card.imagePosition || { x: 0, y: 0, scale: 1 }
        })
        .select()
        .single();

      if (error) {
        console.error('Save error:', error);
        toast.error('Failed to save card');
        return null;
      }

      await loadCards(); // Refresh the cards list
      return data.id;
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save card');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Update existing card
  const updateCard = async (cardId: string, updates: Partial<FamilyCard>): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('cards')
        .update({
          name: updates.name,
          relationship: updates.relationship || null,
          date_of_birth: updates.dateOfBirth || null,
          favorite_color: updates.favoriteColor || null,
          hobbies: updates.hobbies || null,
          fun_fact: updates.funFact || null,
          photo_url: updates.photo_url || null,
          image_position: updates.imagePosition || { x: 0, y: 0, scale: 1 }
        })
        .eq('id', cardId);

      if (error) {
        console.error('Update error:', error);
        toast.error('Failed to update card');
        return false;
      }

      await loadCards(); // Refresh the cards list
      return true;
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update card');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Delete card
  const deleteCard = async (cardId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete card');
        return false;
      }

      await loadCards(); // Refresh the cards list
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete card');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Link cards to order
  const linkCardsToOrder = async (orderId: string): Promise<boolean> => {
    try {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from('cards')
        .update({ order_id: orderId })
        .eq('user_session_id', sessionId)
        .is('order_id', null);

      if (error) {
        console.error('Link error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Link error:', error);
      return false;
    }
  };

  // Load cards on component mount
  useEffect(() => {
    loadCards();
  }, []);

  return {
    cards,
    loading,
    saving,
    uploadImage,
    saveCard,
    updateCard,
    deleteCard,
    linkCardsToOrder,
    refreshCards: loadCards
  };
};