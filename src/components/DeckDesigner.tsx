import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Palette } from "lucide-react";
import { BackgroundThemeSelector } from "./BackgroundThemeSelector";

interface DeckDesignerProps {
  recipientName: string;
  selectedTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  selectedFont?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
  onRecipientNameChange: (name: string) => void;
  onThemeChange: (theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports') => void;
  onFontChange: (font: 'bubblegum' | 'luckiest-guy' | 'fredoka-one') => void;
  onPreviewChange?: (theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports', font: 'bubblegum' | 'luckiest-guy' | 'fredoka-one') => void;
}

export const DeckDesigner = ({
  recipientName,
  selectedTheme,
  selectedFont,
  onRecipientNameChange,
  onThemeChange,
  onFontChange,
  onPreviewChange
}: DeckDesignerProps) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-purple/20 rounded-3xl shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-2xl font-black">
          <Heart className="h-6 w-6 text-art-purple" />
          <span>Design Your Deck</span>
        </CardTitle>
        <p className="text-muted-foreground">
          Choose the overall design for your family cards and tell us who they're for
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipient Name */}
        <div>
          <Label htmlFor="recipientName" className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-art-pink" />
            Who is this deck for?
          </Label>
          <Input
            id="recipientName"
            value={recipientName}
            onChange={(e) => onRecipientNameChange(e.target.value)}
            placeholder="e.g., Grandma Sarah, The Johnson Family, My Cousin"
            className="h-12 text-base"
          />
          <p className="text-sm text-muted-foreground mt-2">
            This helps personalize the experience and could be used for special messaging
          </p>
        </div>

        {/* Theme and Font Selection */}
        <div>
          <Label className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Palette className="h-5 w-5 text-art-blue" />
            Choose Your Style
          </Label>
          <BackgroundThemeSelector
            selectedTheme={selectedTheme}
            selectedFont={selectedFont}
            onThemeChange={onThemeChange}
            onFontChange={onFontChange}
            onPreviewChange={onPreviewChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};