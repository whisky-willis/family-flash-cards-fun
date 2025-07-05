import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FamilyCard } from '@/pages/CreateCards';

interface UseAutoSaveCollectionProps {
  cards: FamilyCard[];
  onSaveComplete?: () => void;
}

export function useAutoSaveCollection({ cards, onSaveComplete }: UseAutoSaveCollectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔍 useAutoSaveCollection hook:', { 
      user: user?.id, 
      cardsLength: cards.length,
      cards: cards.length > 0 ? 'has cards' : 'no cards'
    });
  }, [user, cards]);

  useEffect(() => {
    const handleSignupMessage = async (event: MessageEvent) => {
      console.log('📨 Received message:', event.data, 'from origin:', event.origin);
      
      // Only handle messages from our own origin
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'NEW_USER_SIGNUP' && event.data?.user && cards.length > 0) {
        console.log('🚀 Processing NEW_USER_SIGNUP with cards:', cards.length);
        
        // Wait a moment for the user session to be fully established
        setTimeout(async () => {
          try {
            console.log('💾 Attempting to save collection for user:', event.data.user.id);
            
            const { error } = await supabase
              .from('card_collections')
              .insert({
                user_id: event.data.user.id,
                name: 'My First Collection',
                description: 'Collection created during sign-up',
                cards: JSON.parse(JSON.stringify(cards)) as any
              });

            if (error) {
              console.error('❌ Auto-save collection error:', error);
              throw error;
            }

            console.log('✅ Collection auto-saved successfully!');
            toast({
              title: "Collection Saved!",
              description: "Your cards have been automatically saved to your new account.",
            });

            onSaveComplete?.();
          } catch (err: any) {
            console.error('❌ Failed to auto-save collection:', err);
            toast({
              title: "Welcome!",
              description: "Your account was created successfully. You can now save your card collection manually.",
            });
          }
        }, 2000);
      }
    };

    // Listen for auth state changes to handle new user signups
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, 'user:', session?.user?.id, 'cards:', cards.length);
        
        if (event === 'SIGNED_IN' && session?.user && cards.length > 0) {
          console.log('🔍 Checking if user has existing collections...');
          
          // Check if this is a new user by checking if they have any existing collections
          const { data: existingCollections } = await supabase
            .from('card_collections')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1);

          console.log('📊 Existing collections:', existingCollections?.length || 0);

          // If no existing collections and we have cards to save, auto-save
          if ((!existingCollections || existingCollections.length === 0)) {
            try {
              console.log('💾 Auto-saving first collection for signed-in user:', session.user.id);
              
              const { error } = await supabase
                .from('card_collections')
                .insert({
                  user_id: session.user.id,
                  name: 'My First Collection',
                  description: 'Collection created during sign-up',
                  cards: JSON.parse(JSON.stringify(cards)) as any
                });

              if (error) {
                console.error('❌ Auto-save error:', error);
                throw error;
              }

              console.log('✅ Auto-save completed successfully!');
              toast({
                title: "Collection Saved!",
                description: "Your cards have been automatically saved to your account.",
              });

              onSaveComplete?.();
            } catch (err: any) {
              console.error('❌ Failed to auto-save collection:', err);
            }
          } else {
            console.log('ℹ️ User already has collections, skipping auto-save');
          }
        }
      }
    );

    // Listen for messages from popup windows (for signup flow)
    window.addEventListener('message', handleSignupMessage);

    console.log('👂 Event listeners added for auto-save collection');

    return () => {
      console.log('🧹 Cleaning up auto-save collection listeners');
      subscription.unsubscribe();
      window.removeEventListener('message', handleSignupMessage);
    };
  }, [cards, toast, onSaveComplete]);
}