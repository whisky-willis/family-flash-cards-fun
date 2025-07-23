import { useState, useEffect, useCallback } from 'react';
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
  front_image_url?: string;
  back_image_url?: string;
  print_ready?: boolean;
}

export const useSupabaseCardsStorage = () => {
  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadedFromDraft, setLoadedFromDraft] = useState(false);

  // Generate or get session ID for temporary storage
  const getSessionId = () => {
    let sessionId = localStorage.getItem('card_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('card_session_id', sessionId);
    }
    return sessionId;
  };

  // Utility function to sanitize card names for filenames
  const sanitizeCardName = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
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

  // Upload generated card image to storage
  const uploadCardRender = async (
    imageBlob: Blob, 
    cardId: string, 
    side: 'front' | 'back',
    cardName?: string,
    userId?: string
  ): Promise<string | null> => {
    try {
      const sessionId = getSessionId();
      const userFolder = userId || sessionId;
      const fileBaseName = cardName ? sanitizeCardName(cardName) : cardId;
      const fileName = `${userFolder}/${fileBaseName}_${side}.png`;
      
      console.log(`🎯 Uploading ${side} image for card ${cardId}, blob size:`, imageBlob.size);
      console.log(`📁 Using filename: ${fileName}`);
      
      const { data, error } = await supabase.storage
        .from('card-renders')
        .upload(fileName, imageBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ Upload render error:', error);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('card-renders')
        .getPublicUrl(data.path);

      console.log(`✅ Successfully uploaded ${side} image:`, publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('❌ Upload render error:', error);
      return null;
    }
  };

  // Enhanced function to convert URL to blob
  const urlToBlob = async (url: string): Promise<Blob | null> => {
    try {
      console.log('🎯 Converting URL to blob:', url.slice(0, 50) + '...');
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error('❌ Failed to fetch URL:', response.status, response.statusText);
        return null;
      }
      
      const blob = await response.blob();
      console.log('✅ URL converted to blob, size:', blob.size, 'type:', blob.type);
      return blob;
    } catch (error) {
      console.error('❌ Error converting URL to blob:', error);
      return null;
    }
  };

  // Generate and save card images
  const generateCardImages = async (
    cardId: string, 
    frontImageUrl?: string, 
    backImageUrl?: string,
    cardName?: string,
    userId?: string
  ): Promise<{ front_image_url?: string; back_image_url?: string; success: boolean }> => {
    try {
      console.log('🎯 Starting generateCardImages for card:', cardId);
      console.log('🎯 Card name:', cardName, 'User ID:', userId);
      console.log('🎯 Received URLs:', { frontImageUrl: !!frontImageUrl, backImageUrl: !!backImageUrl });
      
      const updateData: any = {};
      
      if (frontImageUrl) {
        console.log('🎯 Processing front image...');
        const frontBlob = await urlToBlob(frontImageUrl);
        
        if (frontBlob) {
          console.log('🎯 Front blob ready, size:', frontBlob.size);
          const frontUploadUrl = await uploadCardRender(frontBlob, cardId, 'front', cardName, userId);
          if (frontUploadUrl) {
            updateData.front_image_url = frontUploadUrl;
            console.log('✅ Front image uploaded successfully');
          } else {
            console.error('❌ Failed to upload front image');
          }
        } else {
          console.error('❌ Failed to convert front image URL to blob');
        }
      }
      
      if (backImageUrl) {
        console.log('🎯 Processing back image...');
        const backBlob = await urlToBlob(backImageUrl);
        
        if (backBlob) {
          console.log('🎯 Back blob ready, size:', backBlob.size);
          const backUploadUrl = await uploadCardRender(backBlob, cardId, 'back', cardName, userId);
          if (backUploadUrl) {
            updateData.back_image_url = backUploadUrl;
            console.log('✅ Back image uploaded successfully');
          } else {
            console.error('❌ Failed to upload back image');
          }
        } else {
          console.error('❌ Failed to convert back image URL to blob');
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        updateData.print_ready = true;
        
        console.log('🎯 Updating database with:', updateData);
        
        const { error } = await supabase
          .from('cards')
          .update(updateData)
          .eq('id', cardId);
          
        if (error) {
          console.error('❌ Error updating card with images:', error);
          return { success: false };
        }
        
        console.log('✅ Database updated successfully');
        
        // Only refresh from database if we're not working with draft cards
        if (!loadedFromDraft) {
          console.log('🎯 Refreshing from database (not in draft mode)');
          await loadCardsFromDatabase(false);
        } else {
          console.log('🎯 Skipping database refresh - working with draft cards');
          
          // Update the current cards state with the new image URLs
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === cardId 
                ? { ...card, ...updateData }
                : card
            )
          );
        }
        
        return { ...updateData, success: true };
      }
      
      console.log('⚠️ No images to update');
      return { success: false };
    } catch (error) {
      console.error('❌ Error generating card images:', error);
      return { success: false };
    }
  };

  // Set initial cards from draft - now properly memoized
  const setInitialCards = useCallback((initialCards: FamilyCard[]) => {
    console.log('🎯 useSupabaseCardsStorage: Setting initial cards from draft:', initialCards.length);
    console.log('🎯 useSupabaseCardsStorage: Current state before setInitialCards:', { 
      isInitialized, 
      loadedFromDraft, 
      cardsLength: cards.length 
    });
    
    setCards(initialCards);
    setIsInitialized(true);
    setLoadedFromDraft(true); // Mark that cards came from draft
    
    console.log('🎯 useSupabaseCardsStorage: After setInitialCards - marked as loadedFromDraft=true');
  }, [isInitialized, loadedFromDraft, cards.length]);

  // Load cards from database with proper draft protection
  const loadCardsFromDatabase = async (forceRefresh: boolean = false) => {
    console.log('🎯 useSupabaseCardsStorage: loadCardsFromDatabase called with forceRefresh:', forceRefresh);
    console.log('🎯 useSupabaseCardsStorage: Current state:', { 
      isInitialized, 
      loadedFromDraft, 
      cardsLength: cards.length 
    });
    
    // Don't load from database if we've already been initialized with draft cards
    // UNLESS this is a forced refresh (explicit user action)
    if (isInitialized && loadedFromDraft && !forceRefresh) {
      console.log('🎯 useSupabaseCardsStorage: Skipping database load - already initialized with draft cards and not forced');
      return;
    }

    // Also skip if we're already initialized and this is not a forced refresh
    if (isInitialized && !forceRefresh) {
      console.log('🎯 useSupabaseCardsStorage: Skipping database load - already initialized and not forced');
      return;
    }

    setLoading(true);
    
    // Only reset loadedFromDraft flag when it's a forced refresh
    if (forceRefresh) {
      console.log('🎯 useSupabaseCardsStorage: Forced refresh - resetting loadedFromDraft flag');
      setLoadedFromDraft(false);
    }
    
    try {
      const sessionId = getSessionId();
      
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_session_id', sessionId)
        .is('order_id', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Load error:', error);
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
        imagePosition: (card.image_position as { x: number; y: number; scale: number }) || { x: 0, y: 0, scale: 1 },
        front_image_url: card.front_image_url || undefined,
        back_image_url: card.back_image_url || undefined,
        print_ready: card.print_ready || false
      }));

      console.log('🎯 useSupabaseCardsStorage: Loaded cards from database:', formattedCards.length);
      
      // Only update cards if we haven't loaded from draft OR this is a forced refresh
      if (!loadedFromDraft || forceRefresh) {
        console.log('🎯 useSupabaseCardsStorage: Updating cards from database');
        setCards(formattedCards);
      } else {
        console.log('🎯 useSupabaseCardsStorage: Skipping setCards - preserving draft data');
      }
      
      setIsInitialized(true);
      
      // Only set loadedFromDraft=false if this was a forced refresh
      if (forceRefresh) {
        console.log('🎯 useSupabaseCardsStorage: Forced refresh complete - loadedFromDraft=false');
      } else {
        console.log('🎯 useSupabaseCardsStorage: Non-forced refresh complete - preserving loadedFromDraft state');
      }
      
    } catch (error) {
      console.error('❌ Load error:', error);
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  // Legacy function name for backward compatibility
  const loadCards = () => loadCardsFromDatabase(false);

  // Explicit refresh function that forces a database load
  const forceRefreshCards = () => loadCardsFromDatabase(true);

  // Save card to database (without image generation)
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
        console.error('❌ Save error:', error);
        toast.error('Failed to save card');
        return null;
      }

      // Only refresh from database if we're not working with draft cards
      if (!loadedFromDraft) {
        console.log('🎯 Refreshing from database after save (not in draft mode)');
        await loadCardsFromDatabase(false);
      } else {
        console.log('🎯 Skipping database refresh after save - working with draft cards');
      }
      
      return data.id;
    } catch (error) {
      console.error('❌ Save error:', error);
      toast.error('Failed to save card');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Update existing card (without image generation)
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
        console.error('❌ Update error:', error);
        toast.error('Failed to update card');
        return false;
      }

      // Only refresh from database if we're not working with draft cards
      if (!loadedFromDraft) {
        console.log('🎯 Refreshing from database after update (not in draft mode)');
        await loadCardsFromDatabase(false);
      } else {
        console.log('🎯 Skipping database refresh after update - working with draft cards');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Update error:', error);
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
        console.error('❌ Delete error:', error);
        toast.error('Failed to delete card');
        return false;
      }

      // Only refresh from database if we're not working with draft cards
      if (!loadedFromDraft) {
        console.log('🎯 Refreshing from database after delete (not in draft mode)');
        await loadCardsFromDatabase(false);
      } else {
        console.log('🎯 Skipping database refresh after delete - working with draft cards');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Delete error:', error);
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
        console.error('❌ Link error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Link error:', error);
      return false;
    }
  };

  // Load cards on component mount - FIXED to prevent race condition
  useEffect(() => {
    console.log('🎯 useSupabaseCardsStorage: useEffect triggered with state:', { 
      isInitialized, 
      loadedFromDraft 
    });
    
    // Only load from database if we haven't been initialized at all
    // This prevents the race condition with setInitialCards
    if (!isInitialized) {
      console.log('🎯 useSupabaseCardsStorage: Loading cards from database on mount (not initialized)');
      loadCardsFromDatabase(false);
    } else {
      console.log('🎯 useSupabaseCardsStorage: Skipping database load - already initialized');
    }
  }, []); // Empty dependency array - only run on mount

  return {
    cards,
    loading,
    saving,
    uploadImage,
    saveCard,
    updateCard,
    deleteCard,
    linkCardsToOrder,
    refreshCards: loadCardsFromDatabase, // Use the new function that accepts forceRefresh parameter
    forceRefreshCards, // Explicit force refresh function
    generateCardImages,
    setInitialCards
  };
};
