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
import { Mail } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { toast } = useToast();

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
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

  const handleClose = () => {
    setMagicLinkSent(false);
    setEmail('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Sign In to Kindred Cards
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your email to receive a magic link for instant sign-in
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {!magicLinkSent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email Address</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleMagicLink();
                    }
                  }}
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
                We'll email you a secure link to sign in instantly. No password needed!
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
                  We sent a magic link to {email}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click the link in your email to complete sign-in
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