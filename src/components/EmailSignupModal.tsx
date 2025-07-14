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
import { Mail, Save, CheckCircle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { FamilyCard } from '@/pages/CreateCards';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDraft } from '@/hooks/useDraft';

interface EmailSignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: FamilyCard[];
  onSuccess: () => void;
}

export function EmailSignupModal({ open, onOpenChange, cards, onSuccess }: EmailSignupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const { user, isAnonymous } = useAuth();
  const { toast } = useToast();
  const { saveDraftToLocal } = useDraft();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSignup = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save draft cards to localStorage before signup
      if (cards.length > 0) {
        saveDraftToLocal(cards);
        console.log('💾 Saved draft cards to localStorage before signup:', cards.length);
      }

      // Sign up user with email verification
      const { error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: crypto.randomUUID(), // Generate a random password for email-only signup
        options: {
          emailRedirectTo: `${window.location.origin}/create-cards`,
          data: {
            signup_type: 'save_for_later',
            has_draft_cards: cards.length > 0
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead or use a different email.');
        } else {
          setError(signUpError.message || 'Failed to send verification email');
        }
        return;
      }

      setEmailSent(true);
      
      toast({
        title: "Verification Email Sent!",
        description: "Please check your email and click the verification link to save your cards.",
      });

    } catch (error: any) {
      console.error('❌ Email signup error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setEmailSent(false);
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !emailSent) {
      handleEmailSignup();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Save className="h-5 w-5 text-art-pink" />
            <span>Save Cards for Later</span>
          </DialogTitle>
          <DialogDescription>
            {emailSent ? 
              "We've sent you a verification link!" : 
              "Enter your email to save your cards and create an account"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!emailSent ? (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="focus:ring-2 focus:ring-art-pink"
                />
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleEmailSignup}
                  disabled={loading || !email.trim()}
                  className="w-full bg-art-pink hover:bg-art-pink/90 text-white"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Send Verification Email</span>
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>We'll create an account for you and save your {cards.length} card{cards.length !== 1 ? 's' : ''}.</p>
                <p>You'll receive a verification email to activate your account.</p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Check Your Email</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a verification link to:
                </p>
                <p className="font-medium text-art-pink">{email}</p>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Click the link in your email to verify your account and save your cards.</p>
                <p>Your {cards.length} card{cards.length !== 1 ? 's' : ''} will be automatically saved once verified.</p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full"
                variant="outline"
              >
                Got it!
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}