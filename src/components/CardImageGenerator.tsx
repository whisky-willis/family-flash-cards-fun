import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Download, Loader2 } from "lucide-react";
import { CardPreview, CardPreviewRef } from "./CardPreview";
import { FlipCardPreview, FlipCardPreviewRef } from "./FlipCardPreview";
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";
import { toast } from 'sonner';

interface CardImageGeneratorProps {
  card: FamilyCard;
  isFlipCard?: boolean;
  deckTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  deckFont?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
  onImagesGenerated?: (frontUrl?: string, backUrl?: string) => void;
}

export const CardImageGenerator: React.FC<CardImageGeneratorProps> = ({
  card,
  isFlipCard = false,
  deckTheme,
  deckFont,
  onImagesGenerated
}) => {
  const cardPreviewRef = useRef<CardPreviewRef>(null);
  const flipCardPreviewRef = useRef<FlipCardPreviewRef>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImages = async () => {
    if (!cardPreviewRef.current && !flipCardPreviewRef.current) {
      toast.error('Card preview not available');
      return;
    }

    setIsGenerating(true);
    
    try {
      let frontImageUrl: string | null = null;
      let backImageUrl: string | null = null;

      if (isFlipCard && flipCardPreviewRef.current) {
        // Generate both front and back for flip cards
        frontImageUrl = await flipCardPreviewRef.current.generateFrontImage();
        backImageUrl = await flipCardPreviewRef.current.generateBackImage();
        
        if (frontImageUrl && backImageUrl) {
          toast.success('Print images generated successfully!');
          onImagesGenerated?.(frontImageUrl, backImageUrl);
        } else {
          toast.error('Failed to generate print images');
        }
      } else if (cardPreviewRef.current) {
        // Generate single image for regular cards
        frontImageUrl = await cardPreviewRef.current.generateImage();
        
        if (frontImageUrl) {
          toast.success('Print image generated successfully!');
          onImagesGenerated?.(frontImageUrl);
        } else {
          toast.error('Failed to generate print image');
        }
      }
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate print images');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Button
          onClick={handleGenerateImages}
          disabled={isGenerating}
          variant="outline"
          className="border-2 border-art-blue text-art-blue hover:bg-art-blue hover:text-white font-bold uppercase text-xs tracking-wide"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Generate Print Images
            </>
          )}
        </Button>
      </div>

      {/* Hidden preview components for image generation */}
      <div className="hidden">
        {isFlipCard ? (
          <FlipCardPreview
            ref={flipCardPreviewRef}
            card={card}
            deckTheme={deckTheme}
            deckFont={deckFont}
          />
        ) : (
          <CardPreview
            ref={cardPreviewRef}
            card={card}
            deckTheme={deckTheme}
            deckFont={deckFont}
          />
        )}
      </div>

      {/* Show generated images if available */}
      {(card.front_image_url || card.back_image_url) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-center">Generated Print Images</h4>
          <div className={`grid gap-2 ${card.back_image_url ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {card.front_image_url && (
              <div className="text-center space-y-1">
                <img 
                  src={card.front_image_url} 
                  alt="Front card render" 
                  className="w-full max-w-32 mx-auto rounded border"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadImage(card.front_image_url!, `${card.name}_front.png`)}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Front
                </Button>
              </div>
            )}
            {card.back_image_url && (
              <div className="text-center space-y-1">
                <img 
                  src={card.back_image_url} 
                  alt="Back card render" 
                  className="w-full max-w-32 mx-auto rounded border"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadImage(card.back_image_url!, `${card.name}_back.png`)}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Back
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};