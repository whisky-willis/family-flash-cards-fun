import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Palette, Edit2, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { BackgroundThemeSelector } from "./BackgroundThemeSelector";

interface DeckDesignerProps {
  recipientName: string;
  selectedTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  selectedFont?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
  initiallyCollapsed?: boolean;
  onRecipientNameChange: (name: string) => void;
  onThemeChange: (theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports') => void;
  onFontChange: (font: 'bubblegum' | 'luckiest-guy' | 'fredoka-one') => void;
  onPreviewChange?: (theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports', font: 'bubblegum' | 'luckiest-guy' | 'fredoka-one') => void;
}

export const DeckDesigner = ({
  recipientName,
  selectedTheme,
  selectedFont,
  initiallyCollapsed = false,
  onRecipientNameChange,
  onThemeChange,
  onFontChange,
  onPreviewChange
}: DeckDesignerProps) => {
  const isDesignComplete = recipientName && selectedTheme && selectedFont;
  const [isExpanded, setIsExpanded] = useState(!(initiallyCollapsed && isDesignComplete));
  
  // Update expanded state when initiallyCollapsed and isDesignComplete change
  useEffect(() => {
    if (initiallyCollapsed && isDesignComplete) {
      setIsExpanded(false);
    }
  }, [initiallyCollapsed, isDesignComplete]);
  
  // Helper functions to get display names
  const getThemeDisplayName = (theme?: string) => {
    const themeNames = {
      geometric: 'Geometric',
      organic: 'Organic',
      rainbow: 'Rainbow',
      mosaic: 'Mosaic',
      space: 'Space',
      sports: 'Sports'
    };
    return theme ? themeNames[theme as keyof typeof themeNames] : 'Not selected';
  };

  const getFontDisplayName = (font?: string) => {
    const fontNames = {
      'bubblegum': 'Bubblegum',
      'luckiest-guy': 'Luckiest Guy',
      'fredoka-one': 'Fredoka One'
    };
    return font ? fontNames[font as keyof typeof fontNames] : 'Not selected';
  };

  // Auto-collapse when design is complete and user starts adding cards
  React.useEffect(() => {
    if (isDesignComplete && isExpanded) {
      // Keep expanded initially, but user can manually collapse
    }
  }, [isDesignComplete, isExpanded]);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-purple/20 rounded-3xl shadow-lg mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 text-2xl font-black">
              <Heart className="h-6 w-6 text-art-purple" />
              <span>Design Your Deck</span>
            </CardTitle>
            {!isExpanded && isDesignComplete && (
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                <p><strong>For:</strong> {recipientName}</p>
                <p><strong>Theme:</strong> {getThemeDisplayName(selectedTheme)} • <strong>Font:</strong> {getFontDisplayName(selectedFont)}</p>
              </div>
            )}
            {isExpanded && (
              <p className="text-muted-foreground mt-1">
                Choose the overall design for your family cards and tell us who they're for
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isExpanded && isDesignComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-art-purple border-art-purple/30 hover:bg-art-purple/10"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {isDesignComplete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-art-purple hover:bg-art-purple/10"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Recipient Name */}
          <div>
            <Label htmlFor="recipientName" className="text-lg font-semibold flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-art-pink" />
              Who is this deck for?
            </Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => onRecipientNameChange(e.target.value)}
              placeholder="e.g., Grandma Sarah, The Johnson Family, My Cousin"
              className="h-12 text-base relative z-10 pointer-events-auto"
              autoComplete="off"
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

          {isDesignComplete && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => setIsExpanded(false)}
                variant="outline"
                className="w-full text-art-purple border-art-purple/30 hover:bg-art-purple/10 hover:text-art-purple"
              >
                👍
                Save Design
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};