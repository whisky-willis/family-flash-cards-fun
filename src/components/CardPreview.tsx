import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Music } from "lucide-react";
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

  // Comprehensive hobby-to-emoji mapping system
  const getHobbyEmojis = (hobby: string) => {
    const hobbyLower = hobby.toLowerCase();
    
    // Sports & Physical Activities
    if (hobbyLower.match(/soccer|football(?!\s+american)/)) return ['⚽', '🥅', '🏆'];
    if (hobbyLower.match(/basketball/)) return ['🏀', '⛹️', '🏀'];
    if (hobbyLower.match(/tennis/)) return ['🎾', '🏸', '🎾'];
    if (hobbyLower.match(/baseball|softball/)) return ['⚾', '🥎', '⚾'];
    if (hobbyLower.match(/volleyball/)) return ['🏐', '🏐', '🏐'];
    if (hobbyLower.match(/golf/)) return ['⛳', '🏌️', '⛳'];
    if (hobbyLower.match(/hockey/)) return ['🏒', '🥅', '🏒'];
    if (hobbyLower.match(/american\s+football/)) return ['🏈', '🏈', '🏈'];
    if (hobbyLower.match(/swimming|pool/)) return ['🏊', '🌊', '🏄'];
    if (hobbyLower.match(/running|jogging|marathon/)) return ['🏃', '👟', '🏃'];
    if (hobbyLower.match(/cycling|biking|bike/)) return ['🚴', '🚲', '🚴'];
    if (hobbyLower.match(/climbing|mountain/)) return ['🧗', '⛰️', '🧗'];
    if (hobbyLower.match(/skiing|snowboard/)) return ['⛷️', '🎿', '⛷️'];
    if (hobbyLower.match(/surfing|surf/)) return ['🏄', '🌊', '🏄'];
    if (hobbyLower.match(/yoga|meditation/)) return ['🧘', '🕉️', '🧘'];
    if (hobbyLower.match(/martial\s+arts|karate|judo|taekwondo/)) return ['🥋', '👊', '🥋'];
    if (hobbyLower.match(/boxing/)) return ['🥊', '👊', '🥊'];
    if (hobbyLower.match(/dance|dancing|ballet/)) return ['💃', '🕺', '🎭'];
    
    // Creative Arts
    if (hobbyLower.match(/music|piano|guitar|violin|drums|singing/)) return ['🎵', '🎶', '🎼'];
    if (hobbyLower.match(/art|painting|drawing|sketch/)) return ['🎨', '🖌️', '✏️'];
    if (hobbyLower.match(/photography|photo/)) return ['📷', '📸', '🎞️'];
    if (hobbyLower.match(/writing|poetry|journaling/)) return ['✍️', '📝', '📖'];
    if (hobbyLower.match(/sculpting|pottery|ceramics/)) return ['🏺', '🎨', '🏺'];
    if (hobbyLower.match(/knitting|sewing|embroidery|crafts/)) return ['🧶', '✂️', '🪡'];
    if (hobbyLower.match(/jewelry|beading/)) return ['💎', '💍', '💎'];
    
    // Technology & Gaming
    if (hobbyLower.match(/gaming|video\s+games|computer\s+games/)) return ['🎮', '🕹️', '🎮'];
    if (hobbyLower.match(/programming|coding|development/)) return ['💻', '⌨️', '💻'];
    if (hobbyLower.match(/robotics|electronics/)) return ['🤖', '⚡', '🤖'];
    
    // Food & Cooking
    if (hobbyLower.match(/cooking|baking|culinary/)) return ['👨‍🍳', '🍰', '🥧'];
    if (hobbyLower.match(/wine|beer|brewing/)) return ['🍷', '🍺', '🍷'];
    if (hobbyLower.match(/coffee|barista/)) return ['☕', '☕', '☕'];
    
    // Nature & Outdoors
    if (hobbyLower.match(/garden|gardening|plant/)) return ['🌱', '🌸', '🌻'];
    if (hobbyLower.match(/hiking|walking|trail/)) return ['🥾', '🌲', '🥾'];
    if (hobbyLower.match(/camping|outdoor/)) return ['🏕️', '🔥', '🏕️'];
    if (hobbyLower.match(/fishing/)) return ['🎣', '🐟', '🎣'];
    if (hobbyLower.match(/hunting/)) return ['🏹', '🦌', '🏹'];
    if (hobbyLower.match(/bird\s*watching|birding/)) return ['🦅', '🔭', '🦅'];
    
    // Learning & Reading
    if (hobbyLower.match(/reading|book/)) return ['📚', '📖', '📝'];
    if (hobbyLower.match(/learning|studying|education/)) return ['📚', '🎓', '📚'];
    if (hobbyLower.match(/language/)) return ['🗣️', '📚', '🗣️'];
    
    // Travel & Culture
    if (hobbyLower.match(/travel|traveling|vacation/)) return ['✈️', '🗺️', '🎒'];
    if (hobbyLower.match(/collecting|collection/)) return ['🏆', '💎', '🏆'];
    
    // Games & Puzzles
    if (hobbyLower.match(/chess/)) return ['♟️', '♛', '♟️'];
    if (hobbyLower.match(/puzzle|crossword|sudoku/)) return ['🧩', '🔍', '🧩'];
    if (hobbyLower.match(/board\s+games|card\s+games/)) return ['🎲', '🃏', '🎲'];
    
    // Animals & Pets
    if (hobbyLower.match(/pet|dog|cat|animal/)) return ['🐕', '🐱', '🐕'];
    if (hobbyLower.match(/horse|riding|equestrian/)) return ['🐎', '🏇', '🐎'];
    
    // Science & Space
    if (hobbyLower.match(/astronomy|space|stars/)) return ['🔭', '⭐', '🔭'];
    if (hobbyLower.match(/science|chemistry|physics/)) return ['🔬', '⚗️', '🔬'];
    
    // Health & Wellness
    if (hobbyLower.match(/fitness|gym|workout/)) return ['💪', '🏋️', '💪'];
    
    // Automotive & Transportation
    if (hobbyLower.match(/car|automotive|racing/)) return ['🏎️', '🚗', '🏎️'];
    if (hobbyLower.match(/motorcycle|motorbike/)) return ['🏍️', '🏍️', '🏍️'];
    
    // Default fallback - try to pick relevant emojis based on common words
    if (hobbyLower.match(/build|make|create/)) return ['🔨', '⚒️', '🔨'];
    if (hobbyLower.match(/watch|view|see/)) return ['👀', '📺', '👀'];
    if (hobbyLower.match(/listen|hear|audio/)) return ['👂', '🎧', '👂'];
    if (hobbyLower.match(/social|friend|people/)) return ['👥', '🤝', '👥'];
    if (hobbyLower.match(/relax|chill|rest/)) return ['😌', '🛋️', '😌'];
    
    // Ultimate fallback for any unrecognized hobby
    return ['⭐', '✨', '🎯'];
  };

  const renderHobbyBackground = () => {
    if (!card.hobbies || !card.favoriteColor) return null;
    
    const emojis = getHobbyEmojis(card.hobbies);
    const colorValue = getColorValue(card.favoriteColor);
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Scattered emoji pattern - increased size and reduced opacity for clarity */}
        <div 
          className="absolute top-2 left-4 opacity-30 text-4xl"
          style={{ color: colorValue }}
        >
          {emojis[0]}
        </div>
        <div 
          className="absolute top-8 right-6 opacity-20 text-2xl"
          style={{ color: colorValue }}
        >
          {emojis[1]}
        </div>
        <div 
          className="absolute bottom-12 left-6 opacity-40 text-3xl"
          style={{ color: colorValue }}
        >
          {emojis[2]}
        </div>
        <div 
          className="absolute bottom-4 right-4 opacity-30 text-4xl"
          style={{ color: colorValue }}
        >
          {emojis[0]}
        </div>
        <div 
          className="absolute top-1/2 left-2 opacity-20 text-xl"
          style={{ color: colorValue }}
        >
          {emojis[1]}
        </div>
        <div 
          className="absolute top-1/3 right-2 opacity-30 text-2xl"
          style={{ color: colorValue }}
        >
          {emojis[2]}
        </div>
        
        {/* Music hobby gets special treatment with Lucide icon - increased size */}
        {(card.hobbies.toLowerCase().includes('music') || 
          card.hobbies.toLowerCase().includes('piano') || 
          card.hobbies.toLowerCase().includes('guitar')) && (
          <>
            <Music 
              className="absolute top-6 right-8 opacity-20 h-12 w-12" 
              style={{ color: colorValue }}
            />
            <Music 
              className="absolute bottom-8 left-8 opacity-30 h-8 w-8" 
              style={{ color: colorValue }}
            />
          </>
        )}
      </div>
    );
  };

  // Determine background style
  const getBackgroundStyle = () => {
    if (card.hobbies && card.favoriteColor && card.hobbies.trim() && card.favoriteColor.trim()) {
      const colorValue = getColorValue(card.favoriteColor);
      return {
        background: `linear-gradient(135deg, ${colorValue}15, ${colorValue}08, white)`
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
        {/* Hobby-themed background */}
        {renderHobbyBackground()}
        
        <CardContent className="p-6 relative z-10">
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

          {/* Attributes with white background for visibility */}
          <div className="space-y-2 text-base bg-white/95 rounded-2xl p-4 backdrop-blur-sm shadow-sm">
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
