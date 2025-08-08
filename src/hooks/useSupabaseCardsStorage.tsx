import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDraft } from './useDraft';
import { useAuth } from './useAuth';

export interface FamilyCard {
  id: string;
  name: string;
  relationship?: string;
  dateOfBirth?: string;
  favoriteColor?: string;
  hobbies?: string;
  funFact?: string;
  photo?: string;
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
  const { user } = useAuth();
  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadedFromDraft, setLoadedFromDraft] = useState(false);
  const [hasAttemptedMigration, setHasAttemptedMigration] = useState(false);
  
  // Ref to track current loadedFromDraft value for async functions
  const loadedFromDraftRef = useRef(false);
  
  // Import draft functionality
  const { getDraft, saveDraftToLocal, clearDraft } = useDraft();

  // Generate or get session ID for temporary storage with proper isolation
  const getSessionId = () => {
    let sessionId = localStorage.getItem('card_session_id');
    const lastSessionCheck = localStorage.getItem('last_session_check');
    const now = Date.now();
    
    // Check if session is older than 1 hour or if it's from a different browser session
    const sessionAge = lastSessionCheck ? now - parseInt(lastSessionCheck) : Infinity;
    const isOldSession = sessionAge > 3600000; // 1 hour
    
    if (!sessionId || isOldSession) {
      // Generate new session ID with better uniqueness
      sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}${performance.now().toString(36).substr(2, 5)}`;
      localStorage.setItem('card_session_id', sessionId);
      localStorage.setItem('last_session_check', now.toString());
      console.log('🆔 Generated new session ID:', sessionId);
      
      // Clear any old session data
      const oldDraft = localStorage.getItem('kindred-cards-draft');
      if (oldDraft && isOldSession) {
        console.log('🧹 Clearing old session draft data');
        localStorage.removeItem('kindred-cards-draft');
      }
    } else {
      // Update last check time for existing session
      localStorage.setItem('last_session_check', now.toString());
      console.log('🆔 Using existing session ID:', sessionId);
    }
    
    return sessionId;
  };

  // Utility function to sanitize card names for filenames
  const sanitizeCardName = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  // Extract storage path from public URL for deletion
  const extractStoragePath = (publicUrl: string): string | null => {
    try {
      const url = new URL(publicUrl);
      const marker = '/object/public/card-renders/';
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        return url.pathname.substring(idx + marker.length);
      }
      const parts = url.pathname.split(marker);
      return parts.length === 2 ? parts[1] : null;
    } catch {
      return null;
    }
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
      const timestamp = Date.now();
      const fileName = `${userFolder}/${fileBaseName}_${side}_${timestamp}.png`;
      
      console.log(`🎯 Uploading ${side} image for card ${cardId}, blob size:`, imageBlob.size);
      console.log(`📁 Using filename: ${fileName}`);
      
      const { data, error } = await supabase.storage
        .from('card-renders')
        .upload(fileName, imageBlob, {
          cacheControl: '31536000',
          upsert: false
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
      
      // Capture previous image URLs for cleanup after successful upload
      const existingCard = cards.find(c => c.id === cardId);
      const previousFrontUrl = existingCard?.front_image_url;
      const previousBackUrl = existingCard?.back_image_url;
      
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
        
        // Cleanup previous render files if replaced
        try {
          const pathsToRemove: string[] = [];
          if (previousFrontUrl && updateData.front_image_url && previousFrontUrl !== updateData.front_image_url) {
            const p = extractStoragePath(previousFrontUrl);
            if (p) pathsToRemove.push(p);
          }
          if (previousBackUrl && updateData.back_image_url && previousBackUrl !== updateData.back_image_url) {
            const p = extractStoragePath(previousBackUrl);
            if (p) pathsToRemove.push(p);
          }
          if (pathsToRemove.length > 0) {
            console.log('🧹 Removing previous render files:', pathsToRemove);
            const { error: removeError } = await supabase.storage.from('card-renders').remove(pathsToRemove);
            if (removeError) {
              console.warn('⚠️ Failed to remove previous files:', removeError);
            } else {
              console.log('🧹 Previous render files removed successfully');
            }
          }
        } catch (cleanupErr) {
          console.warn('⚠️ Cleanup error:', cleanupErr);
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

  // Update ref whenever loadedFromDraft state changes
  useEffect(() => {
    loadedFromDraftRef.current = loadedFromDraft;
  }, [loadedFromDraft]);

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
    loadedFromDraftRef.current = true; // Update ref immediately
    
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
      console.log('🆔 Loading cards for session ID:', sessionId);
      
      let query = supabase.from('cards').select('*').order('created_at', { ascending: true });

      if (user) {
        // Load authenticated user's cards
        console.log('🔑 Loading cards for authenticated user:', user.id);
        query = query.eq('user_id', user.id);
      } else {
        // Load guest session cards
        const sessionId = getSessionId();
        console.log('🆔 Loading cards for guest session:', sessionId);
        query = query.eq('guest_session_id', sessionId).is('user_id', null);
      }

      // Only include cards not linked to orders
      query = query.is('order_id', null);

      const { data, error } = await query;

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
        photo: card.photo || undefined,
        imagePosition: (card.image_position as { x: number; y: number; scale: number }) || { x: 0, y: 0, scale: 1 },
        front_image_url: card.front_image_url || undefined,
        back_image_url: card.back_image_url || undefined,
        print_ready: card.print_ready || false
      }));

      console.log('🎯 useSupabaseCardsStorage: Loaded cards from database:', formattedCards.length);
      
      // Log card details for debugging
      if (formattedCards.length > 0) {
        console.log('🔍 Session card details:', formattedCards.map(card => ({ 
          id: card.id, 
          name: card.name, 
          sessionId: sessionId 
        })));
      }
      
      // Safety check: Filter out any cards that don't belong to current session
      const sessionFilteredCards = formattedCards.filter(card => {
        // Additional safety check for session isolation
        return true; // Cards are already filtered by session ID in query
      });
      
      if (sessionFilteredCards.length !== formattedCards.length) {
        console.warn('⚠️ Filtered out cards from different sessions');
      }
      
      // CRITICAL: Use ref to get current loadedFromDraft value (not stale state from when async call started)
      const currentLoadedFromDraft = loadedFromDraftRef.current;
      console.log('🎯 useSupabaseCardsStorage: Current loadedFromDraft value (via ref):', currentLoadedFromDraft);
      
      // Only update cards if we haven't loaded from draft OR this is a forced refresh
      if (!currentLoadedFromDraft || forceRefresh) {
        console.log('🎯 useSupabaseCardsStorage: Updating cards from database');
        setCards(sessionFilteredCards);
      } else {
        console.log('🎯 useSupabaseCardsStorage: Skipping setCards - draft was loaded during database request');
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

  // Save card to database (without image generation) - FIXED to update local state
  const saveCard = async (card: Omit<FamilyCard, 'id'>): Promise<string | null> => {
    setSaving(true);
    try {
      const sessionId = getSessionId();
      
      const insertData: any = {
        name: card.name,
        relationship: card.relationship || null,
        date_of_birth: card.dateOfBirth || null,
        favorite_color: card.favoriteColor || null,
        hobbies: card.hobbies || null,
        fun_fact: card.funFact || null,
        photo: card.photo || null,
        image_position: card.imagePosition || { x: 0, y: 0, scale: 1 }
      };

      if (user) {
        insertData.user_id = user.id;
      } else {
        const sessionId = getSessionId();
        insertData.guest_session_id = sessionId;
      }

      const { data, error } = await supabase
        .from('cards')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Save error:', error);
        toast.error('Failed to save card');
        return null;
      }

      // Convert database response to FamilyCard format
      const newCard: FamilyCard = {
        id: data.id,
        name: data.name,
        relationship: data.relationship || undefined,
        dateOfBirth: data.date_of_birth || undefined,
        favoriteColor: data.favorite_color || undefined,
        hobbies: data.hobbies || undefined,
        funFact: data.fun_fact || undefined,
        photo: data.photo || undefined,
        imagePosition: (data.image_position as { x: number; y: number; scale: number }) || { x: 0, y: 0, scale: 1 },
        front_image_url: data.front_image_url || undefined,
        back_image_url: data.back_image_url || undefined,
        print_ready: data.print_ready || false
      };

      // Update local state immediately
      setCards(prevCards => [...prevCards, newCard]);
      console.log('✅ Card saved and added to local state:', newCard.name);
      
      return data.id;
    } catch (error) {
      console.error('❌ Save error:', error);
      toast.error('Failed to save card');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Update existing card (without image generation) - FIXED to update local state
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
          photo: updates.photo || null,
          image_position: updates.imagePosition || { x: 0, y: 0, scale: 1 }
        })
        .eq('id', cardId);

      if (error) {
        console.error('❌ Update error:', error);
        toast.error('Failed to update card');
        return false;
      }

      // Update local state immediately
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === cardId 
            ? { ...card, ...updates }
            : card
        )
      );
      console.log('✅ Card updated in local state:', cardId);
      
      return true;
    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error('Failed to update card');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Delete card - handles both database cards and draft cards
  const deleteCard = async (cardId: string): Promise<boolean> => {
    setSaving(true);
    try {
      console.log('🗑️ Deleting card:', cardId);
      
      // Check if this is a draft card (timestamp ID) or a database card (UUID)
      const isDraftCard = /^\d+$/.test(cardId);
      
      if (!isDraftCard) {
        // Try to delete from database for UUID cards
        const { error } = await supabase
          .from('cards')
          .delete()
          .eq('id', cardId);

        if (error) {
          console.error('❌ Delete error:', error);
          // If it's a UUID format error or card not found, treat as draft card
          if (error.message.includes('invalid input syntax for type uuid') || 
              error.message.includes('No rows affected') ||
              error.code === 'PGRST116') {
            console.log('🔄 Card not found in database, treating as draft card');
          } else {
            toast.error('Failed to delete card');
            return false;
          }
        }
      } else {
        console.log('📝 Deleting draft card (not in database)');
      }

      // Remove from local state regardless of database result
      const updatedCards = cards.filter(card => card.id !== cardId);
      setCards(updatedCards);
      console.log('✅ Card deleted from local state:', cardId);
      
      // Update draft in localStorage to persist the deletion
      try {
        const currentDraft = getDraft();
        saveDraftToLocal(updatedCards, currentDraft.deckDesign);
        console.log('💾 Draft updated after card deletion');
      } catch (error) {
        console.error('⚠️ Failed to update draft after deletion:', error);
        // Don't fail the deletion if draft saving fails
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
        .eq('guest_session_id', sessionId)
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

  // Migrate guest cards to authenticated user
  const migrateGuestCardsToUser = async () => {
    if (!user || hasAttemptedMigration) return;
    
    try {
      const sessionId = localStorage.getItem('card_session_id');
      if (!sessionId) return;

      console.log('🔄 Migrating guest cards to authenticated user:', user.id);
      
      const { data, error } = await supabase.rpc('migrate_guest_cards_to_user', {
        guest_session_id_param: sessionId,
        user_id_param: user.id
      });

      if (error) {
        console.error('❌ Migration error:', error);
        return;
      }

      const cardsMigrated = data || 0;
      console.log('✅ Successfully migrated cards:', cardsMigrated);

      if (cardsMigrated > 0) {
        toast.success(`Successfully transferred ${cardsMigrated} card${cardsMigrated === 1 ? '' : 's'} to your account.`);
        
        // Clear the guest session after successful migration
        localStorage.removeItem('card_session_id');
        localStorage.removeItem('last_session_check');
        clearDraft();
        
        // Force refresh to load user's cards including migrated ones
        setHasAttemptedMigration(true);
        await loadCardsFromDatabase(true);
      }
    } catch (error) {
      console.error('❌ Migration error:', error);
    }
  };

  // Handle authentication changes
  useEffect(() => {
    if (user && !hasAttemptedMigration) {
      migrateGuestCardsToUser();
    }
  }, [user, hasAttemptedMigration]);

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
