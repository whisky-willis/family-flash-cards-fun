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
      (event, session) => {
        console.log('🔐 Global auth state change:', event, 'user:', session?.user?.id, 'session valid:', !!session);
        
        // Handle sign-ins (including first-time after email verification)
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to ensure the session is fully established
          setTimeout(async () => {
            try {
              // Verify auth session is working
              const { data: testAuth, error: authError } = await supabase.auth.getUser();
              console.log('🔐 Auth verification:', { user: testAuth.user?.id, error: authError });
              
              if (authError || !testAuth.user) {
                console.error('❌ Auth session not properly established:', authError);
                return;
              }
              
              // Check localStorage for any saved cards
              const savedCards = localStorage.getItem('kindred_draft_cards');
              console.log('📋 Checking localStorage for saved cards:', !!savedCards);
              
              if (savedCards) {
                const cards = JSON.parse(savedCards);
                console.log('📋 Found saved cards in localStorage:', cards.length);
                
                if (cards.length > 0) {
                  // Check if this is a new user by checking if they have any existing collections
                  const { data: existingCollections, error: fetchError } = await supabase
                    .from('card_collections')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .limit(1);

                  if (fetchError) {
                    console.error('❌ Error checking existing collections:', fetchError);
                    toast({
                      title: "Authentication Error",
                      description: "Unable to verify your account. Please try signing in again.",
                      variant: "destructive",
                    });
                    return;
                  }

                  console.log('📊 Existing collections for user:', existingCollections?.length || 0);

                  // If no existing collections and we have cards to save, auto-save
                  if (!existingCollections || existingCollections.length === 0) {
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
                      toast({
                        title: "Save Error",
                        description: "Failed to auto-save your cards. Please save manually from the create page.",
                        variant: "destructive",
                      });
                      return;
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
              } else {
                console.log('📋 No saved cards found in localStorage');
              }
            } catch (err: any) {
              console.error('❌ Failed to parse or save cards from localStorage:', err);
              toast({
                title: "Auto-save Error",
                description: "Failed to automatically save your cards. Please save manually.",
                variant: "destructive",
              });
            }
          }, 2000); // Wait 2 seconds to ensure session is fully established
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up global auto-save listeners');
      subscription.unsubscribe();
    };
  }, [user, toast]);
}