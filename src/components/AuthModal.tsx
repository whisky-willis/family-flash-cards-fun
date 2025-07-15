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
      // Create new account with proper error handling
      const { data, error: signUpError } = await signUp(email, password, name);
      
      if (signUpError) {
        // Handle specific signup errors
        if (signUpError.message?.includes('Email rate limit')) {
          throw new Error('Too many signup attempts. Please wait a moment and try again.');
        } else if (signUpError.message?.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (signUpError.message?.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (signUpError.message?.includes('Password')) {
          throw new Error('Password must be at least 6 characters long.');
        }
        throw signUpError;
      }

      // For new signups, we get the user from the signup response
      // even if email confirmation is pending
      if (data?.user) {
        // Wait a moment for the auth state to settle
        setTimeout(async () => {
          try {
            await saveCollectionForUser(data.user.id);
          } catch (saveError: any) {
            setError(saveError.message || 'Account created but failed to save cards. Please try again.');
            setLoading(false);
          }
        }, 500);
      } else {
        throw new Error('Failed to create account');
      }
      
    } catch (err: any) {
      console.error('Account creation error:', err);
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
    // Don't set loading to false here - it's handled in the catch block or setTimeout
  };

  const saveCollectionForUser = async (userId: string) => {
    try {
      console.log('Attempting to save collection for user:', userId);
      
      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: userId,
          name: deckDesign?.recipientName || 'My Card Collection',
          description: 'Cards created in the card builder',
          cards: JSON.parse(JSON.stringify(cards)) as any,
          deck_design: deckDesign ? JSON.parse(JSON.stringify(deckDesign)) as any : null
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Collection saved successfully');
      
      toast({
        title: "Success!",
        description: "Your account has been created and cards saved! Please check your email to verify your account.",
      });

      onSuccess();
      onOpenChange(false);
      setLoading(false);
    } catch (err: any) {
      console.error('Save collection error:', err);
      throw new Error(err.message || 'Failed to save collection');
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
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
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