import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Edit, Trash2, Eye, Download } from "lucide-react";
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";
import { FlippableCardPreview } from "@/components/FlippableCardPreview";
import { useCardCapture } from "@/hooks/useCardCapture";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const { captureCard, captureCardAsDataUrl, isCapturing } = useCardCapture();
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  // Expose image generation methods via ref using html-to-image
  useImperativeHandle(ref, () => ({
    generateFrontImage: async () => {
      console.log('🎯 generateFrontImage called for CardPreview');
      
      if (!cardRef.current) {
        console.error('❌ Card element not available');
        return null;
      }
      
      setIsGeneratingImages(true);
      
      try {
        console.log('🎯 Using html-to-image for front image generation...');
        
        // Find the FlippableCardPreview component and ensure it shows the front
        const flippableCard = cardRef.current.querySelector('[style*="perspective"]');
        if (flippableCard) {
          // Force front view by removing any flip transformation
          const cardContent = flippableCard.querySelector('[style*="transform"]') as HTMLElement;
          if (cardContent) {
            const originalTransform = cardContent.style.transform;
            cardContent.style.transform = 'rotateY(0deg)';
            
            // Wait a moment for the transformation to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const frontImageUrl = await captureCardAsDataUrl(cardRef.current, { format: 'png' });
            
            // Restore original transform
            cardContent.style.transform = originalTransform;
            
            console.log('✅ Front image generated:', !!frontImageUrl);
            return frontImageUrl;
          }
        }
        
        // Fallback to capturing current state
        const frontImageUrl = await captureCardAsDataUrl(cardRef.current, { format: 'png' });
        console.log('✅ Front image generated:', !!frontImageUrl);
        return frontImageUrl;
      } catch (error) {
        console.error('❌ Error generating front card image:', error);
        return null;
      } finally {
        setIsGeneratingImages(false);
      }
    },
    generateBackImage: async () => {
      console.log('🎯 generateBackImage called for CardPreview');
      
      if (!cardRef.current) {
        console.error('❌ Card element not available');
        return null;
      }
      
      setIsGeneratingImages(true);
      
      try {
        console.log('🎯 Using html-to-image for back image generation...');
        
        // Find the FlippableCardPreview component and flip it to show the back
        const flippableCard = cardRef.current.querySelector('[style*="perspective"]');
        if (flippableCard) {
          const cardContent = flippableCard.querySelector('[style*="transform"]') as HTMLElement;
          if (cardContent) {
            const originalTransform = cardContent.style.transform;
            cardContent.style.transform = 'rotateY(180deg)';
            
            // Wait a moment for the transformation to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const backImageUrl = await captureCardAsDataUrl(cardRef.current, { format: 'png' });
            
            // Restore original transform
            cardContent.style.transform = originalTransform;
            
            console.log('✅ Back image generated:', !!backImageUrl);
            return backImageUrl;
          }
        }
        
        // Fallback to capturing current state
        const backImageUrl = await captureCardAsDataUrl(cardRef.current, { format: 'png' });
        console.log('✅ Back image generated:', !!backImageUrl);
        return backImageUrl;
      } catch (error) {
        console.error('❌ Error generating back card image:', error);
        return null;
      } finally {
        setIsGeneratingImages(false);
      }
    }
  }));

  const handleDownload = async () => {
    if (cardRef.current) {
      await captureCard(cardRef.current, `${card.name}-kindred-card`);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative group" ref={cardRef}>
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
              onClick={handleDownload}
              disabled={isCapturing || isGeneratingImages}
              className="flex-1 border-2 border-art-blue text-art-blue hover:bg-art-blue hover:text-white font-bold uppercase text-xs tracking-wide"
            >
              <Download className="h-3 w-3 mr-1" />
              {(isCapturing || isGeneratingImages) ? 'Saving...' : 'Download'}
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

    </div>
  );
});