import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Global auto-save hook that works from any page
export function useGlobalAutoSave() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🌍 Global auto-save hook initialized');

    // Listen for auth state changes to handle new user signups
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Global auth state change:', event, 'user:', session?.user?.id);
        
        // Handle sign-ins (including first-time after email verification)
        if (event === 'SIGNED_IN' && session?.user) {
          // Check localStorage for any saved cards
          const savedCards = localStorage.getItem('kindred_draft_cards');
          
          if (savedCards) {
            try {
              const cards = JSON.parse(savedCards);
              console.log('📋 Found saved cards in localStorage:', cards.length);
              
              if (cards.length > 0) {
                // Check if this is a new user by checking if they have any existing collections
                const { data: existingCollections } = await supabase
                  .from('card_collections')
                  .select('id')
                  .eq('user_id', session.user.id)
                  .limit(1);

                console.log('📊 Existing collections for user:', existingCollections?.length || 0);

                // If no existing collections and we have cards to save, auto-save
                if ((!existingCollections || existingCollections.length === 0)) {
                  console.log('💾 Auto-saving first collection for new user:', session.user.id);
                  
                  const { error } = await supabase
                    .from('card_collections')
                    .insert({
                      user_id: session.user.id,
                      name: 'My First Collection',
                      description: 'Collection created during sign-up',
                      cards: cards
                    });

                  if (error) {
                    console.error('❌ Auto-save error:', error);
                    throw error;
                  }

                  console.log('✅ Auto-save completed successfully!');
                  
                  // Clear the localStorage after successful save
                  localStorage.removeItem('kindred_draft_cards');
                  
                  toast({
                    title: "Collection Saved!",
                    description: "Your cards have been automatically saved to your account.",
                  });
                } else {
                  console.log('ℹ️ User already has collections, skipping auto-save');
                }
              }
            } catch (err: any) {
              console.error('❌ Failed to parse or save cards from localStorage:', err);
            }
          } else {
            console.log('📋 No saved cards found in localStorage');
          }
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up global auto-save listeners');
      subscription.unsubscribe();
    };
  }, [user, toast]);
}