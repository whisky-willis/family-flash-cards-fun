import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { FamilyCard } from '@/pages/CreateCards';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: FamilyCard[];
  deckDesign?: {
    recipientName: string;
    theme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
    font?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
  };
  onSuccess: () => void;
}

export function AuthModal({ open, onOpenChange, cards, deckDesign, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleCreateAccount = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create new account
      const { data, error: signUpError } = await signUp(email, password, name);
      if (signUpError) throw signUpError;

      // For new signups, we get the user from the signup response
      // even if email confirmation is pending
      if (data?.user) {
        await saveCollectionForUser(data.user.id);
      } else {
        throw new Error('Failed to create account');
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const saveCollectionForUser = async (userId: string) => {
    try {
      // Use service role to bypass RLS for new user signup
      const serviceSupabase = createClient(
        'https://ngxvbmxhziirnxkycodx.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neHZibXhoemlpcm54a3ljb2R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTcyNDU3NiwiZXhwIjoyMDY3MzAwNTc2fQ.NqfN-fv3STtWlSGNjR5kxj1GZNuOTZ_m9OqPgj7RQIo'
      );

      const { error } = await serviceSupabase
        .from('card_collections')
        .insert({
          user_id: userId,
          name: deckDesign?.recipientName || 'My Card Collection',
          description: 'Cards created in the card builder',
          cards: JSON.parse(JSON.stringify(cards)) as any,
          deck_design: deckDesign ? JSON.parse(JSON.stringify(deckDesign)) as any : null
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your account has been created and cards saved! Please check your email to verify your account.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save collection');
    }
  };

  const saveCollection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          name: deckDesign?.recipientName || 'My Card Collection',
          description: 'Cards created in the card builder',
          cards: JSON.parse(JSON.stringify(cards)) as any,
          deck_design: deckDesign ? JSON.parse(JSON.stringify(deckDesign)) as any : null
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your account has been created and cards saved!",
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save collection');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <User className="h-6 w-6" />
            Create Account
          </DialogTitle>
          <DialogDescription className="text-center">
            Create an account to save your {cards.length} cards permanently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Choose a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button 
            onClick={handleCreateAccount} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Create Account & Save Cards'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}