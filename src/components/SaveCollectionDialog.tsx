import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FamilyCard } from '@/pages/CreateCards';

interface SaveCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: FamilyCard[];
  onAuthRequired: () => void;
}

export function SaveCollectionDialog({ 
  open, 
  onOpenChange, 
  cards, 
  onAuthRequired 
}: SaveCollectionDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAnonymous, convertAnonymousUser } = useAuth();
  const { toast } = useToast();

  const showSignUpForm = isAnonymous || !user;

  const handleSave = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    if (cards.length === 0) {
      setError('Cannot save an empty collection');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: saveError } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          cards: JSON.parse(JSON.stringify(cards)) as any
        });

      if (saveError) throw saveError;

      toast({
        title: "Collection Saved!",
        description: `Your collection "${name}" has been saved successfully.`,
      });

      // Reset form and close dialog
      setName('');
      setDescription('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save collection');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpAndSave = async () => {
    if (!email.trim() || !password.trim() || !userName.trim()) {
      setError('All fields are required');
      return;
    }

    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isAnonymous) {
        // Convert anonymous user to permanent account
        const { error: convertError } = await convertAnonymousUser(email, password, userName);
        if (convertError) throw convertError;

        toast({
          title: "Account Created!",
          description: "Your account has been created and your cards have been saved.",
        });
      } else {
        // Regular sign up flow
        onAuthRequired();
        return;
      }

      // The cards are already saved automatically when user converts from anonymous
      // Reset form and close dialog
      setName('');
      setDescription('');
      setEmail('');
      setPassword('');
      setUserName('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {showSignUpForm ? 'Sign Up to Save Cards' : 'Save Card Collection'}
          </DialogTitle>
          <DialogDescription>
            {showSignUpForm 
              ? `Create an account to permanently save your ${cards.length} cards.`
              : `Save your collection of ${cards.length} cards for future use.`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {showSignUpForm && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="userName">Name *</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your full name"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a secure password"
                  disabled={loading}
                />
              </div>
            </>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Collection Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Family Collection"
              disabled={loading}
            />
          </div>
          {!showSignUpForm && (
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your collection..."
                disabled={loading}
              />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={showSignUpForm ? handleSignUpAndSave : handleSave} 
            disabled={loading}
          >
            {loading 
              ? 'Saving...' 
              : showSignUpForm 
                ? 'Create Account & Save Cards' 
                : 'Save Collection'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}