
import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, RotateCcw, RefreshCw } from "lucide-react";
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";
import { CanvasCardRenderer, CanvasCardRendererRef } from "@/components/CanvasCardRenderer";

interface FlipCardPreviewProps {
  card: Partial<FamilyCard>;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  nameFont?: string;
  deckTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  deckFont?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
}

export interface FlipCardPreviewRef {
  generateFrontImage: () => Promise<string | null>;
  generateBackImage: () => Promise<string | null>;
}

export const FlipCardPreview = forwardRef<FlipCardPreviewRef, FlipCardPreviewProps>(({ card, onEdit, onDelete, showActions = false, nameFont = 'font-fredoka-one', deckTheme, deckFont }, ref) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const canvasRendererRef = useRef<CanvasCardRendererRef>(null);

  // Expose image generation methods via ref
  React.useImperativeHandle(ref, () => ({
    generateFrontImage: async () => {
      console.log('🎯 generateFrontImage called for FlipCardPreview');
      
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
      console.log('🎯 generateBackImage called for FlipCardPreview');
      
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

  // Function to get font class name
  const getFontClass = (font?: string) => {
    switch (font) {
      case 'fredoka': return 'font-fredoka';
      case 'comic-neue': return 'font-comic-neue';
      case 'bubblegum': return 'font-bubblegum';
      case 'kalam': return 'font-kalam';
      case 'pangolin': return 'font-pangolin';
      case 'boogaloo': return 'font-boogaloo';
      case 'luckiest-guy': return 'font-luckiest-guy';
      default: return nameFont || 'font-fredoka-one';
    }
  };

  const fontClass = getFontClass(deckFont);

  // Check if card has any meaningful data
  const hasData = card.name && card.name.trim().length > 0;

  if (!hasData) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="aspect-square">
          <Card className="bg-art-yellow/20 border-2 border-dashed border-art-yellow/50 rounded-3xl h-full">
            <CardContent className="p-6 text-center h-full flex flex-col justify-center">
              <Users className="h-12 w-12 text-art-yellow mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Fill in the form to see your flip card preview</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getBackgroundImage = () => {
    if (!deckTheme) return null;
    
    switch (deckTheme) {
      case 'geometric':
        return '/lovable-uploads/b6d6bac9-cbe0-403c-92d3-d931bef709be.png';
      case 'organic':
        return '/lovable-uploads/92562094-6386-421f-8a6e-8066dee1d8b9.png';
      case 'rainbow':
        return '/lovable-uploads/218e023d-f5aa-4d6b-ad30-fe4544c295d4.png';
      case 'mosaic':
        return '/lovable-uploads/473f2252-c157-4af5-8dce-4d10b6e0191a.png';
      case 'space':
        return '/lovable-uploads/a5f11a82-3c49-41b7-a0fc-7c2d29fdcda9.png';
      case 'sports':
        return '/lovable-uploads/73e0e4f2-881f-4259-82b5-0cc0a112eae5.png';
      default:
        return null;
    }
  };

  const getBackgroundStyle = () => {
    const backgroundImage = getBackgroundImage();
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    return { background: 'white' };
  };

  const handleFlip = () => {
    console.log('Flip button clicked, current isFlipped:', isFlipped);
    setIsFlipped(!isFlipped);
    console.log('New isFlipped state will be:', !isFlipped);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Flip Button */}
      {showActions !== false && (
        <div className="mb-4 text-center">
          <Button
            onClick={handleFlip}
            variant="outline"
            size="sm"
            className="border-2 border-art-pink text-art-pink hover:bg-art-pink hover:text-white font-bold uppercase text-xs tracking-wide"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isFlipped ? 'Show Photo' : 'Show Details'}
          </Button>
        </div>
      )}

      {/* Flip Card Container - Fixed dimensions wrapper */}
      <div className="aspect-square perspective-1000" style={{ width: '384px', height: '384px', margin: '0 auto' }}>
        <div 
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Side - Photo */}
          <Card 
            className="absolute inset-0 backface-hidden backdrop-blur-sm border-2 border-art-pink/30 rounded-3xl shadow-lg overflow-hidden"
            style={{
              ...getBackgroundStyle(),
              width: '384px',
              height: '384px'
            }}
          >
            <CardContent className="p-4 relative z-10 h-full flex flex-col">
              {/* Photo Section */}
              <div className="flex-1 flex items-center justify-center mb-4">
                {card.photo_url ? (
                  <div 
                    className="w-full h-full rounded-2xl border-4 border-white shadow-md" 
                    style={{ 
                      backgroundImage: `url(${card.photo_url})`,
                      backgroundSize: card.imagePosition ? `${100 * card.imagePosition.scale}%` : 'cover',
                      backgroundPosition: card.imagePosition
                        ? `${50 + (card.imagePosition.x / (3.6 * card.imagePosition.scale))}% ${50 + (card.imagePosition.y / (3.6 * card.imagePosition.scale))}%`
                        : 'center center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-art-yellow/20 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                    <Users className="h-12 w-12 text-art-yellow" />
                  </div>
                )}
              </div>

              {/* Name at bottom with fixed height */}
              <div className="h-16 flex items-center justify-center">
                <h3 className={`${deckFont === 'bubblegum' ? 'text-5xl' : 'text-3xl'} ${fontClass} text-center text-foreground leading-tight`} style={{
                  textShadow: '0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6)',
                }}>
                  {card.name}
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Back Side - Attributes */}
          <Card 
            className="absolute inset-0 backface-hidden rotate-y-180 backdrop-blur-sm border-2 border-art-pink/30 rounded-3xl shadow-lg overflow-hidden"
            style={{
              ...getBackgroundStyle(),
              width: '384px',
              height: '384px'
            }}
          >
            <CardContent className="p-4 relative z-10 h-full">
              {/* Attributes with white background for visibility */}
              <div className={`bg-white/95 rounded-2xl p-4 backdrop-blur-sm shadow-sm ${fontClass} h-full flex flex-col`}>
                <div className="grid grid-cols-2 gap-3 flex-1 content-start">
                  {card.relationship && card.relationship.trim() && (
                    <div className="text-center">
                      <div className="text-xl mb-1">🏠</div>
                      <div className={`text-blue-400 ${deckFont === 'bubblegum' ? 'text-base' : 'text-sm'} mb-1`}>Where they live</div>
                      <div className="capitalize font-semibold text-black text-base">{card.relationship}</div>
                    </div>
                  )}
                  
                  {card.dateOfBirth && (
                    <div className="text-center">
                      <div className="text-xl mb-1">🎂</div>
                      <div className={`text-green-400 ${deckFont === 'bubblegum' ? 'text-base' : 'text-sm'} mb-1`}>Birthday</div>
                      <div className="font-semibold text-black text-base">
                        {(() => {
                          const [year, month, day] = card.dateOfBirth.split('-').map(Number);
                          const date = new Date(year, month - 1, day);
                          const dayNum = date.getDate();
                          const monthName = date.toLocaleDateString('en-US', { month: 'long' });
                          const suffix = dayNum === 1 || dayNum === 21 || dayNum === 31 ? 'st' 
                                       : dayNum === 2 || dayNum === 22 ? 'nd'
                                       : dayNum === 3 || dayNum === 23 ? 'rd'
                                       : 'th';
                          return `${monthName} ${dayNum}${suffix}`;
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {card.favoriteColor && card.favoriteColor.trim() && (
                    <div className="text-center">
                      <div className="text-xl mb-1">🎨</div>
                      <div className={`text-purple-400 ${deckFont === 'bubblegum' ? 'text-base' : 'text-sm'} mb-1`}>Favorite Color</div>
                      <div className="font-semibold text-black text-base">{card.favoriteColor}</div>
                    </div>
                  )}
                  
                  {card.hobbies && card.hobbies.trim() && (
                    <div className="text-center">
                      <div className="text-xl mb-1">🌟</div>
                      <div className={`text-orange-400 ${deckFont === 'bubblegum' ? 'text-base' : 'text-sm'} mb-1`}>Hobbies</div>
                      <div className="font-semibold text-black text-base">{card.hobbies}</div>
                    </div>
                  )}
                  
                  {card.funFact && card.funFact.trim() && (
                    <div className="col-span-2 text-center p-3 rounded-2xl border-2 bg-yellow-100/80 border-yellow-300">
                      <div className="text-xl mb-1">✨</div>
                      <div className={`text-red-400 ${deckFont === 'bubblegum' ? 'text-base' : 'text-sm'} mb-1`}>Fun Fact</div>
                      <p className="text-sm leading-relaxed font-medium text-black">{card.funFact}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="flex-1 border-2 border-art-green text-art-green hover:bg-art-green hover:text-white font-bold uppercase text-xs tracking-wide"
          >
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDelete}
            className="flex-1 border-2 border-art-red text-art-red hover:bg-art-red hover:text-white font-bold uppercase text-xs tracking-wide"
          >
            Delete
          </Button>
        </div>
      )}

      {/* Card Brand */}
      <div className="text-center mt-2">
        <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground font-medium">
          <Heart className="h-3 w-3 text-art-pink" />
          <span>Kindred Cards</span>
        </div>
      </div>

      {/* Hidden canvas renderer for image generation */}
      {card.id && (
        <div style={{ display: 'none' }}>
          <CanvasCardRenderer
            ref={canvasRendererRef}
            card={card as FamilyCard}
            deckTheme={deckTheme}
            deckFont={deckFont}
          />
        </div>
      )}
    </div>
  );
});
