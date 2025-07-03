import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import { FamilyCard } from "@/pages/CreateCards";

interface CardPreviewProps {
  card: Partial<FamilyCard>;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

// Helper function to map color names to CSS color values
const getColorValue = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    // Basic colors
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#008000',
    'yellow': '#ffff00',
    'orange': '#ffa500',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'black': '#000000',
    'white': '#ffffff',
    'gray': '#808080',
    'grey': '#808080',
    'brown': '#a52a2a',
    'turquoise': '#40e0d0',
    'cyan': '#00ffff',
    'magenta': '#ff00ff',
    'lime': '#00ff00',
    'maroon': '#800000',
    'navy': '#000080',
    'olive': '#808000',
    'silver': '#c0c0c0',
    'teal': '#008080',
    'aqua': '#00ffff',
    'fuchsia': '#ff00ff',
    // Light variations
    'light blue': '#add8e6',
    'light green': '#90ee90',
    'light pink': '#ffb6c1',
    'light yellow': '#ffffe0',
    'light purple': '#dda0dd',
    // Dark variations
    'dark blue': '#00008b',
    'dark green': '#006400',
    'dark red': '#8b0000',
    'dark purple': '#4b0082',
    'dark orange': '#ff8c00'
  };
  
  const normalizedColor = colorName.toLowerCase().trim();
  return colorMap[normalizedColor] || '#666666'; // Default to gray if color not found
};

export const CardPreview = ({ card, onEdit, onDelete, showActions = false }: CardPreviewProps) => {
  const [customBackground, setCustomBackground] = useState<string>('');
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);

  // Check if card has any meaningful data
  const hasData = card.name && card.name.trim().length > 0;

  // Generate unique key for background generation
  const backgroundKey = `${card.hobbies}-${card.favoriteColor}`;

  useEffect(() => {
    const generateCustomBackground = async () => {
      if (card.hobbies && card.favoriteColor && card.hobbies.trim() && card.favoriteColor.trim()) {
        // Create a simple background pattern with hobby elements
        const backgroundId = `bg-${card.hobbies.replace(/\s+/g, '-').toLowerCase()}-${card.favoriteColor.replace(/\s+/g, '-').toLowerCase()}`;
        
        // For now, let's create a CSS-based background with hobby patterns
        // In a real implementation, you could generate actual images here
        setCustomBackground(backgroundId);
      } else {
        setCustomBackground('');
      }
    };

    generateCustomBackground();
  }, [backgroundKey]);

  if (!hasData) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <Card className="bg-art-yellow/20 border-2 border-dashed border-art-yellow/50 rounded-3xl">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-art-yellow mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Fill in the form to see your card preview</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create hobby-themed background patterns
  const getHobbyPattern = (hobby: string, color: string) => {
    const colorValue = getColorValue(color);
    const lightColor = `${colorValue}20`;
    const mediumColor = `${colorValue}40`;
    
    const hobbyLower = hobby.toLowerCase();
    
    // Create different patterns based on hobby type
    if (hobbyLower.includes('soccer') || hobbyLower.includes('football')) {
      return `radial-gradient(circle at 20% 80%, ${lightColor} 15px, transparent 16px),
              radial-gradient(circle at 80% 20%, ${lightColor} 15px, transparent 16px),
              radial-gradient(circle at 40% 40%, ${mediumColor} 8px, transparent 9px),
              linear-gradient(135deg, ${lightColor}, white)`;
    }
    
    if (hobbyLower.includes('basketball')) {
      return `radial-gradient(circle at 25% 25%, ${lightColor} 20px, transparent 21px),
              radial-gradient(circle at 75% 75%, ${lightColor} 20px, transparent 21px),
              linear-gradient(135deg, ${mediumColor}, white)`;
    }
    
    if (hobbyLower.includes('music') || hobbyLower.includes('piano') || hobbyLower.includes('guitar')) {
      return `linear-gradient(45deg, ${lightColor} 25%, transparent 25%),
              linear-gradient(-45deg, ${lightColor} 25%, transparent 25%),
              linear-gradient(135deg, ${mediumColor}, white)`;
    }
    
    if (hobbyLower.includes('art') || hobbyLower.includes('painting') || hobbyLower.includes('drawing')) {
      return `conic-gradient(from 0deg at 50% 50%, ${lightColor}, ${mediumColor}, ${lightColor}),
              radial-gradient(circle at 30% 70%, ${lightColor} 10px, transparent 11px),
              linear-gradient(135deg, white, ${lightColor})`;
    }
    
    if (hobbyLower.includes('dance') || hobbyLower.includes('dancing')) {
      return `linear-gradient(0deg, ${lightColor} 2px, transparent 2px),
              linear-gradient(90deg, ${lightColor} 2px, transparent 2px),
              linear-gradient(135deg, ${mediumColor}, white)`;
    }
    
    if (hobbyLower.includes('reading') || hobbyLower.includes('book')) {
      return `repeating-linear-gradient(0deg, ${lightColor} 0px, ${lightColor} 2px, transparent 2px, transparent 20px),
              linear-gradient(135deg, white, ${lightColor})`;
    }
    
    if (hobbyLower.includes('swimming')) {
      return `repeating-linear-gradient(90deg, ${lightColor} 0px, transparent 5px, ${mediumColor} 10px, transparent 15px),
              linear-gradient(135deg, ${lightColor}, white)`;
    }
    
    // Default pattern for other hobbies
    return `radial-gradient(circle at 30% 30%, ${lightColor} 8px, transparent 9px),
            radial-gradient(circle at 70% 70%, ${mediumColor} 6px, transparent 7px),
            linear-gradient(135deg, ${lightColor}, white)`;
  };

  // Determine background style
  const getBackgroundStyle = () => {
    if (card.hobbies && card.favoriteColor && card.hobbies.trim() && card.favoriteColor.trim()) {
      return {
        background: getHobbyPattern(card.hobbies, card.favoriteColor),
        backgroundSize: '50px 50px, 40px 40px, 100% 100%'
      };
    }
    
    return { background: 'white' };
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card 
        className="backdrop-blur-sm border-2 border-art-pink/30 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
        style={getBackgroundStyle()}
      >
        <CardContent className="p-6">
          {/* Photo Section */}
          <div className="text-center mb-4">
            {card.photo ? (
              <div className="px-4">
                <div 
                  className="relative overflow-hidden rounded-2xl border-4 border-white shadow-md" 
                  style={{ 
                    height: '180px',
                    backgroundImage: `url(${card.photo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: card.imagePosition
                      ? `${50 + (card.imagePosition.x / (3.6 * card.imagePosition.scale))}% ${50 + (card.imagePosition.y / (3.6 * card.imagePosition.scale))}%`
                      : 'center center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 bg-art-yellow/20 rounded-full mx-auto border-4 border-white shadow-md flex items-center justify-center">
                <Users className="h-12 w-12 text-art-yellow" />
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="text-2xl font-black text-center text-foreground mb-4">
            {card.name}
          </h3>

          {/* Attributes */}
          <div className="space-y-2 text-base">
            {card.relationship && card.relationship.trim() && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Relationship:</span>
                <span className="text-foreground capitalize font-medium">{card.relationship}</span>
              </div>
            )}
            
            {card.dateOfBirth && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Birthday:</span>
                <span className="text-foreground font-medium">
                  {(() => {
                    // Parse the date string properly to avoid timezone issues
                    const [year, month, day] = card.dateOfBirth.split('-').map(Number);
                    const date = new Date(year, month - 1, day); // month is 0-indexed
                    const dayNum = date.getDate();
                    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
                    const suffix = dayNum === 1 || dayNum === 21 || dayNum === 31 ? 'st' 
                                 : dayNum === 2 || dayNum === 22 ? 'nd'
                                 : dayNum === 3 || dayNum === 23 ? 'rd'
                                 : 'th';
                    return `${monthName} ${dayNum}${suffix}`;
                  })()}
                </span>
              </div>
            )}
            
            {card.favoriteColor && card.favoriteColor.trim() && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Favorite Color:</span>
                <span 
                  className="text-foreground font-medium"
                  style={{
                    textShadow: `0 0 8px ${getColorValue(card.favoriteColor)}, 0 0 16px ${getColorValue(card.favoriteColor)}40`
                  }}
                >
                  {card.favoriteColor}
                </span>
              </div>
            )}
            
            {card.hobbies && card.hobbies.trim() && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Hobbies:</span>
                <span className="text-foreground text-right font-medium">{card.hobbies}</span>
              </div>
            )}
            
            {card.funFact && card.funFact.trim() && (
              <div className="mt-3 p-3 bg-art-yellow/20 rounded-2xl">
                <span className="font-bold text-muted-foreground block mb-1">Fun Fact:</span>
                <p className="text-foreground text-sm leading-relaxed font-medium">{card.funFact}</p>
              </div>
            )}
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
        </CardContent>
      </Card>

      {/* Card Brand */}
      <div className="text-center mt-2">
        <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground font-medium">
          <Heart className="h-3 w-3 text-art-pink" />
          <span>Kindred Cards</span>
        </div>
      </div>
    </div>
  );
};
