import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook to handle migration of guest cards to authenticated user accounts
 */
export const useCardMigration = () => {
  const { toast } = useToast();

  /**
   * Migrate all guest cards to the authenticated user's account
   */
  const migrateGuestCards = useCallback(async (
    guestSessionId: string,
    userId: string
  ): Promise<number> => {
    if (!guestSessionId || !userId) {
      console.warn('⚠️ useCardMigration: Missing guestSessionId or userId');
      return 0;
    }

    try {
      console.log('🔄 useCardMigration: Starting migration from guest session to user:', {
        guestSessionId,
        userId
      });

      // Call the database function to migrate cards
      const { data, error } = await supabase.rpc('migrate_guest_cards_to_user', {
        guest_session_id_param: guestSessionId,
        user_id_param: userId
      });

      if (error) {
        console.error('❌ useCardMigration: Migration failed:', error);
        toast({
          title: "Migration Error",
          description: "Failed to transfer your cards to your account. Please try again.",
          variant: "destructive",
        });
        return 0;
      }

      const cardsMigrated = data || 0;
      console.log('✅ useCardMigration: Successfully migrated cards:', cardsMigrated);

      if (cardsMigrated > 0) {
        toast({
          title: "Cards Transferred!",
          description: `Successfully transferred ${cardsMigrated} card${cardsMigrated === 1 ? '' : 's'} to your account.`,
        });
      }

      return cardsMigrated;
    } catch (error) {
      console.error('❌ useCardMigration: Unexpected error during migration:', error);
      toast({
        title: "Migration Error",
        description: "An unexpected error occurred while transferring your cards.",
        variant: "destructive",
      });
      return 0;
    }
  }, [toast]);

  return {
    migrateGuestCards
  };
};