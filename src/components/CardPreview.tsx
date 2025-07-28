
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Edit, Trash2, Eye } from "lucide-react";
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";
import { FlippableCardPreview } from "@/components/FlippableCardPreview";
import { CanvasCardRenderer, CanvasCardRendererRef } from "@/components/CanvasCardRenderer";

interface CardPreviewProps {
  card: FamilyCard;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  deckTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  deckFont?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
}

export interface CardPreviewRef {
  generateFrontImage: () => Promise<string | null>;
  generateBackImage: () => Promise<string | null>;
}

export const CardPreview = forwardRef<CardPreviewRef, CardPreviewProps>(({ card, onEdit, onDelete, showActions = true, deckTheme, deckFont }, ref) => {
  const canvasRendererRef = useRef<CanvasCardRendererRef>(null);

  // Expose image generation methods via ref
  useImperativeHandle(ref, () => ({
    generateFrontImage: async () => {
      console.log('🎯 generateFrontImage called for CardPreview');
      
      if (!canvasRendererRef.current) {
        console.error('❌ Canvas renderer not available');
        return null;
      }
      
      try {
        console.log('🎯 Using Canvas API for front image generation...');
        const frontImageUrl = await canvasRendererRef.current.generateFrontImage();
        console.log('✅ Front image generated:', !!frontImageUrl);
        return frontImageUrl;
      } catch (error) {
        console.error('❌ Error generating front card image:', error);
        return null;
      }
    },
    generateBackImage: async () => {
      console.log('🎯 generateBackImage called for CardPreview');
      
      if (!canvasRendererRef.current) {
        console.error('❌ Canvas renderer not available');
        return null;
      }
      
      try {
        console.log('🎯 Using Canvas API for back image generation...');
        const backImageUrl = await canvasRendererRef.current.generateBackImage();
        console.log('✅ Back image generated:', !!backImageUrl);
        return backImageUrl;
      } catch (error) {
        console.error('❌ Error generating back card image:', error);
        return null;
      }
    }
  }));

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative group">
        <div className="transition-transform duration-300 group-hover:scale-[1.02]">
          <FlippableCardPreview 
            card={card}
            deckTheme={deckTheme}
            deckFont={deckFont}
          />
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="flex-1 border-2 border-art-green text-art-green hover:bg-art-green hover:text-white font-bold uppercase text-xs tracking-wide"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDelete}
              className="flex-1 border-2 border-art-red text-art-red hover:bg-art-red hover:text-white font-bold uppercase text-xs tracking-wide"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        )}

        {/* Print ready indicator */}
        {card.print_ready && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Print Ready
          </div>
        )}
      </div>

      {/* Hidden canvas renderer for image generation */}
      <div style={{ display: 'none' }}>
        <CanvasCardRenderer
          ref={canvasRendererRef}
          card={card}
          deckTheme={deckTheme}
          deckFont={deckFont}
        />
      </div>
    </div>
  );
});
