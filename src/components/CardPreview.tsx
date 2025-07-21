
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Edit, Trash2, Eye } from "lucide-react";
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";
import { FlippableCardPreview } from "@/components/FlippableCardPreview";

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
  const [frontElement, setFrontElement] = useState<HTMLDivElement | null>(null);
  const [backElement, setBackElement] = useState<HTMLDivElement | null>(null);

  // Expose image generation methods via ref
  useImperativeHandle(ref, () => ({
    generateFrontImage: async () => {
      console.log('🎯 generateFrontImage called for CardPreview, frontElement:', !!frontElement);
      
      if (!frontElement) {
        console.error('❌ Front element not available for capture');
        return null;
      }
      
      try {
        console.log('🎯 Loading html2canvas...');
        const html2canvas = (await import('html2canvas')).default;
        
        // Wait for fonts to be ready
        await document.fonts.ready;
        
        // Add a small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🎯 Capturing front card with html2canvas...');
        const canvas = await html2canvas(frontElement, {
          backgroundColor: null,
          scale: 4, // Increased from 2 to 4 for higher quality
          useCORS: true,
          allowTaint: true,
          width: 384,
          height: 384,
          pixelRatio: window.devicePixelRatio || 1,
          foreignObjectRendering: false, // Better text rendering
          imageTimeout: 15000,
          removeContainer: true,
          logging: false
        });
        
        console.log('🎯 Front card captured, canvas size:', canvas.width, 'x', canvas.height);
        
        if (canvas.width === 0 || canvas.height === 0) {
          console.error('❌ Canvas has zero dimensions');
          return null;
        }
        
        return new Promise<string>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              console.log('✅ Front image blob created, size:', blob.size);
              resolve(url);
            } else {
              console.error('❌ Failed to create blob from front canvas');
              resolve('');
            }
          }, 'image/png', 1.0); // Maximum quality PNG
        });
      } catch (error) {
        console.error('❌ Error generating front card image:', error);
        return null;
      }
    },
    generateBackImage: async () => {
      console.log('🎯 generateBackImage called for CardPreview, backElement:', !!backElement);
      
      if (!backElement) {
        console.error('❌ Back element not available for capture');
        return null;
      }
      
      try {
        console.log('🎯 Loading html2canvas...');
        const html2canvas = (await import('html2canvas')).default;
        
        // Wait for fonts to be ready
        await document.fonts.ready;
        
        // Add a small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🎯 Capturing back card with html2canvas...');
        const canvas = await html2canvas(backElement, {
          backgroundColor: null,
          scale: 4, // Increased from 2 to 4 for higher quality
          useCORS: true,
          allowTaint: true,
          width: 384,
          height: 384,
          pixelRatio: window.devicePixelRatio || 1,
          foreignObjectRendering: false, // Better text rendering
          imageTimeout: 15000,
          removeContainer: true,
          logging: false
        });
        
        console.log('🎯 Back card captured, canvas size:', canvas.width, 'x', canvas.height);
        
        if (canvas.width === 0 || canvas.height === 0) {
          console.error('❌ Canvas has zero dimensions');
          return null;
        }
        
        return new Promise<string>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              console.log('✅ Back image blob created, size:', blob.size);
              resolve(url);
            } else {
              console.error('❌ Failed to create blob from back canvas');
              resolve('');
            }
          }, 'image/png', 1.0); // Maximum quality PNG
        });
      } catch (error) {
        console.error('❌ Error generating back card image:', error);
        return null;
      }
    }
  }));

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative group">
        <div 
          ref={setFrontElement}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        >
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

      {/* Hidden element for back image capture */}
      <div 
        ref={setBackElement}
        className="fixed left-[-2000px] top-0 pointer-events-none"
        style={{ width: '384px', height: '384px', visibility: 'hidden' }}
      >
        <FlippableCardPreview 
          card={card}
          deckTheme={deckTheme}
          deckFont={deckFont}
        />
      </div>
    </div>
  );
});
