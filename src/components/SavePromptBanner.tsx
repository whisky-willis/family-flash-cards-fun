import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, UserPlus, Cloud } from "lucide-react";

interface SavePromptBannerProps {
  cardCount: number;
  onCreateAccount: () => void;
}

export const SavePromptBanner = ({ cardCount, onCreateAccount }: SavePromptBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if dismissed or no cards
  if (isDismissed || cardCount === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-art-blue/10 to-art-pink/10 border border-art-blue/20 rounded-2xl p-4 mb-6 relative">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-art-blue/20 rounded-full">
            <Cloud className="h-5 w-5 text-art-blue" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Want to save your {cardCount} card{cardCount === 1 ? '' : 's'} and continue later?
            </p>
            <p className="text-sm text-muted-foreground">
              Create a free account to save your work and access it from any device.
            </p>
          </div>
        </div>

        <Button
          onClick={onCreateAccount}
          className="bg-art-blue hover:bg-art-blue/90 text-white whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create Account
        </Button>
      </div>
    </div>
  );
};
