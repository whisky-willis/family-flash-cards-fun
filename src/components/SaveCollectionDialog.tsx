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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Card Collection</DialogTitle>
          <DialogDescription>
            Save your collection of {cards.length} cards for future use.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}