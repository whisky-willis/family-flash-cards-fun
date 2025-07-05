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
    const handleSignupMessage = async (event: MessageEvent) => {
      // Only handle messages from our own origin
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'NEW_USER_SIGNUP' && event.data?.user && cards.length > 0) {
        // Wait a moment for the user session to be fully established
        setTimeout(async () => {
          try {
            const { error } = await supabase
              .from('card_collections')
              .insert({
                user_id: event.data.user.id,
                name: 'My First Collection',
                description: 'Collection created during sign-up',
                cards: JSON.parse(JSON.stringify(cards)) as any
              });

            if (error) throw error;

            toast({
              title: "Collection Saved!",
              description: "Your cards have been automatically saved to your new account.",
            });

            onSaveComplete?.();
          } catch (err: any) {
            console.error('Failed to auto-save collection:', err);
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
        if (event === 'SIGNED_IN' && session?.user && cards.length > 0) {
          // Check if this is a new user by checking if they have any existing collections
          const { data: existingCollections } = await supabase
            .from('card_collections')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1);

          // If no existing collections and we have cards to save, auto-save
          if ((!existingCollections || existingCollections.length === 0)) {
            try {
              const { error } = await supabase
                .from('card_collections')
                .insert({
                  user_id: session.user.id,
                  name: 'My First Collection',
                  description: 'Collection created during sign-up',
                  cards: JSON.parse(JSON.stringify(cards)) as any
                });

              if (error) throw error;

              toast({
                title: "Collection Saved!",
                description: "Your cards have been automatically saved to your account.",
              });

              onSaveComplete?.();
            } catch (err: any) {
              console.error('Failed to auto-save collection:', err);
            }
          }
        }
      }
    );

    // Listen for messages from popup windows (for signup flow)
    window.addEventListener('message', handleSignupMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleSignupMessage);
    };
  }, [cards, toast, onSaveComplete]);
}