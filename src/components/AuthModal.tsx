import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, User, KeyRound } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { FamilyCard } from '@/pages/CreateCards';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: FamilyCard[];
  onSuccess: () => void;
}

export function AuthModal({ open, onOpenChange, cards, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Magic Link state
  const [magicEmail, setMagicEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  
  const { isAnonymous, convertAnonymousUser } = useAuth();
  const { toast } = useToast();

  const handleMagicLink = async () => {
    if (!magicEmail.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`
        }
      });

      if (error) throw error;

      setMagicLinkSent(true);
      toast({
        title: "Magic Link Sent!",
        description: "Check your email and click the link to sign in.",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Name is required for sign up');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (isAnonymous) {
          // Convert anonymous user
          const { error } = await convertAnonymousUser(email, password, name);
          if (error) throw error;
        } else {
          // Regular sign up
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/profile`,
              data: { name }
            }
          });
          if (error) throw error;
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }

      // Save collection after successful auth
      await saveCollection();
      
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
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
          name: 'My Card Collection',
          description: 'Cards created in the card builder',
          cards: JSON.parse(JSON.stringify(cards)) as any
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Save Your Cards
          </DialogTitle>
          <DialogDescription className="text-center">
            Create an account to save your {cards.length} cards permanently
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="magic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="magic" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Magic Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Email & Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="magic" className="space-y-4 mt-6">
            {!magicLinkSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email Address</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="your@email.com"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={handleMagicLink} 
                  disabled={loading} 
                  className="w-full"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  We'll email you a secure link to sign in instantly
                </p>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a magic link to {magicEmail}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setMagicLinkSent(false)}
                  className="w-full"
                >
                  Try Different Email
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant={isSignUp ? "default" : "outline"}
                onClick={() => setIsSignUp(true)}
                size="sm"
              >
                Sign Up
              </Button>
              <Button
                variant={!isSignUp ? "default" : "outline"}
                onClick={() => setIsSignUp(false)}
                size="sm"
              >
                Sign In
              </Button>
            </div>

            {isSignUp && (
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
            )}

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
              onClick={handleEmailAuth} 
              disabled={loading} 
              className="w-full"
            >
              {loading 
                ? 'Processing...' 
                : isSignUp 
                  ? 'Create Account & Save Cards' 
                  : 'Sign In & Save Cards'
              }
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}