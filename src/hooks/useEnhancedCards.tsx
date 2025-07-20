import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FamilyCard } from '@/pages/CreateCards';
import { 
  uploadCardImage, 
  deleteCardImage, 
  getSessionId, 
  migrateBase64ToStorage,
  ImageUploadResult 
} from '@/lib/supabase-storage';

// Extended interface for database card storage
interface DatabaseCard {
  id: string;
  user_session_id?: string;
  user_id?: string;
  name: string;
  relationship?: string;
  date_of_birth?: string;
  favorite_color?: string;
  hobbies?: string;
  fun_fact?: string;
  photo_url?: string;
  photo_storage_path?: string;
  image_position?: { x: number; y: number; scale: number };
  created_at: string;
  updated_at: string;
  order_id?: string;
  is_draft: boolean;
}

export const useEnhancedCards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const sessionId = getSessionId();

  // Convert database card to FamilyCard interface
  const convertDatabaseCard = (dbCard: DatabaseCard): FamilyCard => ({
    id: dbCard.id,
    name: dbCard.name,
    photo: dbCard.photo_url || '', // Use photo_url as photo for backward compatibility
    photo_url: dbCard.photo_url,
    dateOfBirth: dbCard.date_of_birth || '',
    favoriteColor: dbCard.favorite_color || '',
    hobbies: dbCard.hobbies || '',
    funFact: dbCard.fun_fact || '',
    whereTheyLive: dbCard.relationship || '', // Map relationship to whereTheyLive for compatibility
    relationship: dbCard.relationship,
    imagePosition: dbCard.image_position || { x: 0, y: 0, scale: 1 }
  });

  // Convert FamilyCard to database format
  const convertToDatabase = (card: FamilyCard, photoData?: ImageUploadResult): Partial<DatabaseCard> => ({
    name: card.name,
    relationship: card.relationship || card.whereTheyLive,
    date_of_birth: card.dateOfBirth,
    favorite_color: card.favoriteColor,
    hobbies: card.hobbies,
    fun_fact: card.funFact,
    photo_url: photoData?.url || card.photo_url || card.photo,
    photo_storage_path: photoData?.path,
    image_position: card.imagePosition,
    user_id: user?.id,
    user_session_id: user ? null : sessionId,
    is_draft: true
  });

  // Load cards from database
  const loadCards = async () => {
    try {
      let query = supabase
        .from('cards')
        .select('*')
        .eq('is_draft', true)
        .order('created_at', { ascending: true });

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('user_session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error loading cards:', error);
        return;
      }

      const loadedCards = (data || []).map(convertDatabaseCard);
      setCards(loadedCards);
    } catch (error) {
      console.error('❌ Failed to load cards:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Handle image upload for a card
  const handleImageUpload = async (file: File): Promise<ImageUploadResult> => {
    try {
      return await uploadCardImage(file, user?.id);
    } catch (error) {
      console.error('❌ Failed to upload image:', error);
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  };

  // Migrate base64 images to Supabase Storage
  const migrateImageIfNeeded = async (card: FamilyCard): Promise<ImageUploadResult | null> => {
    // If card has base64 photo but no photo_url, migrate it
    if (card.photo && card.photo.startsWith('data:') && !card.photo_url) {
      console.log('🔄 Migrating base64 image to storage...');
      const result = await migrateBase64ToStorage(card.photo, user?.id);
      if (result.url) {
        console.log('✅ Successfully migrated image');
        return result;
      } else {
        console.error('❌ Failed to migrate image:', result.error);
      }
    }
    return null;
  };

  // Add a new card
  const addCard = useCallback(async (newCard: Omit<FamilyCard, 'id'>) => {
    setIsSaving(true);
    try {
      let photoData: ImageUploadResult | null = null;

      // Handle image upload if photoFile is provided
      if (newCard.photoFile) {
        photoData = await handleImageUpload(newCard.photoFile);
        if (photoData.error) {
          throw new Error(photoData.error);
        }
      } else {
        // Try to migrate existing base64 image
        photoData = await migrateImageIfNeeded(newCard as FamilyCard);
      }

      // Save to database
      const { data, error } = await supabase
        .from('cards')
        .insert(convertToDatabase(newCard as FamilyCard, photoData || undefined))
        .select()
        .single();

      if (error) throw error;

      const savedCard = convertDatabaseCard(data);
      setCards(prev => [...prev, savedCard]);

      toast({
        title: "Card Saved!",
        description: `${newCard.name}'s card has been saved with high-resolution image.`,
      });

      return savedCard;
    } catch (error) {
      console.error('❌ Failed to add card:', error);
      toast({
        title: "Save Error",
        description: "Failed to save card. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, sessionId, toast]);

  // Update an existing card
  const updateCard = useCallback(async (cardId: string, updatedCard: Omit<FamilyCard, 'id'>) => {
    setIsSaving(true);
    try {
      let photoData: ImageUploadResult | null = null;

      // Handle new image upload if photoFile is provided
      if (updatedCard.photoFile) {
        photoData = await handleImageUpload(updatedCard.photoFile);
        if (photoData.error) {
          throw new Error(photoData.error);
        }

        // Delete old image if it exists
        const oldCard = cards.find(c => c.id === cardId);
        if (oldCard?.photo_url) {
          const { data: oldCardData } = await supabase
            .from('cards')
            .select('photo_storage_path')
            .eq('id', cardId)
            .single();
          
          if (oldCardData?.photo_storage_path) {
            await deleteCardImage(oldCardData.photo_storage_path);
          }
        }
      } else {
        // Try to migrate existing base64 image
        photoData = await migrateImageIfNeeded(updatedCard as FamilyCard);
      }

      // Update in database
      const updateData = convertToDatabase(updatedCard as FamilyCard, photoData || undefined);
      const { data, error } = await supabase
        .from('cards')
        .update(updateData)
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;

      const updatedCardData = convertDatabaseCard(data);
      setCards(prev => prev.map(card => card.id === cardId ? updatedCardData : card));

      toast({
        title: "Card Updated!",
        description: `${updatedCard.name}'s card has been updated.`,
      });

      return updatedCardData;
    } catch (error) {
      console.error('❌ Failed to update card:', error);
      toast({
        title: "Update Error",
        description: "Failed to update card. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [cards, toast]);

  // Remove a card
  const removeCard = useCallback(async (cardId: string) => {
    try {
      // Get card data to delete associated image
      const { data: cardData } = await supabase
        .from('cards')
        .select('photo_storage_path')
        .eq('id', cardId)
        .single();

      // Delete from database
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      // Delete associated image
      if (cardData?.photo_storage_path) {
        await deleteCardImage(cardData.photo_storage_path);
      }

      setCards(prev => prev.filter(card => card.id !== cardId));

      toast({
        title: "Card Removed",
        description: "The card and its image have been deleted.",
      });
    } catch (error) {
      console.error('❌ Failed to remove card:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete card. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Clear all cards
  const clearCards = useCallback(async () => {
    try {
      // Get all cards to delete their images
      const { data: cardsData } = await supabase
        .from('cards')
        .select('id, photo_storage_path')
        .or(user ? `user_id.eq.${user.id}` : `user_session_id.eq.${sessionId}`)
        .eq('is_draft', true);

      // Delete all cards from database
      const { error } = await supabase
        .from('cards')
        .delete()
        .or(user ? `user_id.eq.${user.id}` : `user_session_id.eq.${sessionId}`)
        .eq('is_draft', true);

      if (error) throw error;

      // Delete associated images
      if (cardsData) {
        const imagePaths = cardsData
          .map(card => card.photo_storage_path)
          .filter(Boolean);
        
        if (imagePaths.length > 0) {
          await supabase.storage
            .from('card-images')
            .remove(imagePaths);
        }
      }

      setCards([]);

      toast({
        title: "Collection Cleared",
        description: "All cards and images have been removed.",
      });
    } catch (error) {
      console.error('❌ Failed to clear cards:', error);
      toast({
        title: "Clear Error",
        description: "Failed to clear collection. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, sessionId, toast]);

  // Migrate session cards to authenticated user
  const migrateSessionCards = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('migrate_session_cards_to_user', {
        session_id: sessionId,
        target_user_id: user.id
      });

      if (error) throw error;

      if (data > 0) {
        console.log(`✅ Migrated ${data} cards to authenticated user`);
        await loadCards(); // Reload cards after migration
        
        toast({
          title: "Cards Migrated!",
          description: `Successfully saved ${data} cards to your account.`,
        });
      }
    } catch (error) {
      console.error('❌ Failed to migrate session cards:', error);
    }
  }, [user, sessionId, toast]);

  // Load cards when component mounts or user changes
  useEffect(() => {
    if (user || sessionId) {
      loadCards();
    }
  }, [user, sessionId]);

  // Handle migration for authenticated users
  useEffect(() => {
    if (user && isLoaded) {
      migrateSessionCards();
    }
  }, [user, isLoaded, migrateSessionCards]);

  return {
    cards,
    isLoaded,
    isSaving,
    addCard,
    updateCard,
    removeCard,
    clearCards,
    refreshCards: loadCards,
    handleImageUpload
  };
};