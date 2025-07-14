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

  const migrateDraftToAuthenticated = useCallback(async () => {
    try {
      console.log('🔍 Checking for draft migration...', { 
        hasUser: !!user, 
        userEmail: user?.email,
        isAnonymous: user?.is_anonymous, 
        cardsLength: cards.length,
        signupType: user?.user_metadata?.signup_type,
        currentDomain: window.location.origin,
        currentPath: window.location.pathname
      });
      
      const draftData = localStorage.getItem('kindred-cards-draft');
      console.log('📦 Draft data found:', !!draftData);
      console.log('📄 Raw draft data:', draftData);
      
      // Debug: Check all localStorage keys for debugging
      console.log('🔍 All localStorage keys:', Object.keys(localStorage));
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('draft') || key && key.includes('kindred')) {
          console.log(`🔑 ${key}:`, localStorage.getItem(key));
        }
      }
      
      if (draftData && user && !user.is_anonymous) {
        console.log('🔄 Attempting to migrate draft cards to authenticated user...');
        
        try {
          const parsedDraft = JSON.parse(draftData);
          console.log('📝 Parsed draft data:', parsedDraft);
          
          let draftCards: FamilyCard[] = [];
          let draftEmail = '';
          
          // Handle both old format (just cards array) and new format (with email)
          if (Array.isArray(parsedDraft)) {
            // Old format - just cards
            draftCards = parsedDraft;
            draftEmail = '';
            console.log('📄 Old draft format detected - no email validation');
          } else if (parsedDraft.cards && Array.isArray(parsedDraft.cards)) {
            // New format - with email and metadata
            draftCards = parsedDraft.cards;
            draftEmail = parsedDraft.email || '';
            console.log('📧 New draft format detected - email:', draftEmail);
          }
          
          console.log('📝 Draft cards found:', draftCards.length);
          
          // Email validation for new format
          if (draftEmail && user.email) {
            if (draftEmail.toLowerCase() !== user.email.toLowerCase()) {
              console.log('❌ Email mismatch - Draft email:', draftEmail, 'User email:', user.email);
              console.log('🚫 Skipping migration due to email mismatch');
              return;
            } else {
              console.log('✅ Email matches! Proceeding with migration');
            }
          }
          
          if (draftCards.length > 0) {
            console.log('💾 Attempting to save cards to database:', draftCards);
            const success = await saveCardsToDatabase(draftCards);
            if (success) {
              setCards(draftCards);
              localStorage.removeItem('kindred-cards-draft');
              console.log('✅ Successfully migrated draft cards');
              toast({
                title: "Welcome! Cards Saved Successfully",
                description: `Your ${draftCards.length} card${draftCards.length !== 1 ? 's have' : ' has'} been saved to your account.`,
              });
              
              // Clear signup_type if it exists
              if (user.user_metadata?.signup_type === 'save_for_later') {
                await supabase.auth.updateUser({
                  data: { signup_type: null }
                });
                console.log('🧹 Cleared signup_type from user metadata');
              }
            } else {
              console.log('❌ Failed to save cards to database');
            }
          } else {
            console.log('📭 No draft cards found to migrate');
          }
        } catch (parseError) {
          console.error('❌ Error parsing draft data:', parseError);
        }
      } else {
        console.log('⏭️ Skipping migration - conditions not met');
      }
    } catch (error) {
      console.error('❌ Failed to migrate draft cards:', error);
    }
  }, [user, toast, cards.length, saveCardsToDatabase]);

  // Initialize user session and load cards
  useEffect(() => {
    const initializeSession = async () => {
      console.log('🚀 Initializing card session...');
      
      // Check if we're in the middle of an auth flow (magic link, etc.)
      const isAuthFlow = window.location.search.includes('token=') || 
                        window.location.search.includes('code=') ||
                        window.location.hash.includes('access_token');
      
      // Check if user explicitly signed out (prevent anonymous creation after sign out)
      const justSignedOut = sessionStorage.getItem('just-signed-out') === 'true';
      
      // Only create anonymous user if:
      // 1. We're on the create page
      // 2. No user exists
      // 3. Not in auth flow
      // 4. User didn't just sign out
      const shouldCreateAnonymous = !user && 
                                   window.location.pathname === '/create-cards' && 
                                   !isAuthFlow && 
                                   !justSignedOut;
      
      if (shouldCreateAnonymous) {
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
  }, [user, createAnonymousUser, toast]);

  // Handle draft migration for authenticated users
  useEffect(() => {
    if (user && !user.is_anonymous && isLoaded) {
      // Always try migration for save_for_later users, or for users with no cards
      const shouldMigrate = cards.length === 0 || user.user_metadata?.signup_type === 'save_for_later';
      
      if (shouldMigrate) {
        console.log('🔄 Migration conditions met:', {
          cardsLength: cards.length,
          signupType: user.user_metadata?.signup_type,
          shouldMigrate
        });
        migrateDraftToAuthenticated();
      } else {
        console.log('⏭️ Migration skipped:', {
          cardsLength: cards.length,
          signupType: user.user_metadata?.signup_type
        });
      }
    }
  }, [user, isLoaded, cards.length, migrateDraftToAuthenticated]);

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