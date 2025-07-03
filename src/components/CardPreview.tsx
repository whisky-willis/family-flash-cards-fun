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

// Comprehensive color mapping function that handles color variations
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
    'gold': '#ffd700',
    'violet': '#ee82ee',
    'indigo': '#4b0082',
    'coral': '#ff7f50',
    'salmon': '#fa8072',
    'khaki': '#f0e68c',
    'lavender': '#e6e6fa',
    'plum': '#dda0dd',
    'crimson': '#dc143c',
    'ivory': '#fffff0',
    'beige': '#f5f5dc',
    'tan': '#d2b48c',
    'bronze': '#cd7f32',
    'copper': '#b87333',
    
    // Light variations
    'light red': '#ffb6c1',
    'light pink': '#ffb6c1',
    'light blue': '#add8e6',
    'light green': '#90ee90',
    'light yellow': '#ffffe0',
    'light purple': '#dda0dd',
    'light orange': '#ffd4aa',
    'light gray': '#d3d3d3',
    'light grey': '#d3d3d3',
    'light brown': '#deb887',
    'light cyan': '#e0ffff',
    'light coral': '#f08080',
    'light salmon': '#ffa07a',
    'light gold': '#ffec8c',
    'light violet': '#dda0dd',
    'light turquoise': '#afeeee',
    'light lime': '#ccff99',
    'light teal': '#b2dfdb',
    'light maroon': '#b03060',
    'light navy': '#6699cc',
    'light olive': '#bdb76b',
    'light magenta': '#ff77ff',
    
    // Dark variations
    'dark red': '#8b0000',
    'dark blue': '#00008b',
    'dark green': '#006400',
    'dark yellow': '#b8860b',
    'dark orange': '#ff8c00',
    'dark purple': '#4b0082',
    'dark pink': '#c71585',
    'dark gray': '#696969',
    'dark grey': '#696969',
    'dark brown': '#654321',
    'dark cyan': '#008b8b',
    'dark coral': '#cd5c5c',
    'dark salmon': '#e9967a',
    'dark gold': '#b8860b',
    'dark violet': '#9400d3',
    'dark turquoise': '#00ced1',
    'dark lime': '#32cd32',
    'dark teal': '#2f4f4f',
    'dark maroon': '#800000',
    'dark olive': '#556b2f',
    'dark magenta': '#8b008b',
    
    // Bright variations
    'bright red': '#ff6b6b',
    'bright blue': '#4dabf7',
    'bright green': '#51cf66',
    'bright yellow': '#ffd43b',
    'bright orange': '#ff922b',
    'bright purple': '#ae3ec9',
    'bright pink': '#f783ac',
    'bright cyan': '#22d3ee',
    'bright lime': '#84cc16',
    'bright coral': '#ff6b6b',
    'bright turquoise': '#06d6a0',
    'bright gold': '#ffd60a',
    'bright violet': '#be4bdb',
    
    // Pale variations
    'pale red': '#ffcccb',
    'pale blue': '#b0c4de',
    'pale green': '#98fb98',
    'pale yellow': '#ffffcc',
    'pale orange': '#ffe4b5',
    'pale purple': '#dcc7aa',
    'pale pink': '#f8d7da',
    'pale cyan': '#e0ffff',
    'pale lime': '#eefaaa',
    'pale coral': '#f5deb3',
    'pale turquoise': '#afeeee',
    'pale gold': '#eee8aa',
    'pale violet': '#dda0dd',
    
    // Deep variations
    'deep red': '#cc0000',
    'deep blue': '#003366',
    'deep green': '#003300',
    'deep yellow': '#cc9900',
    'deep orange': '#cc6600',
    'deep purple': '#330066',
    'deep pink': '#cc0066',
    'deep cyan': '#006666',
    'deep lime': '#336600',
    'deep coral': '#cc3333',
    'deep turquoise': '#006666',
    'deep gold': '#cc9900',
    'deep violet': '#660099',
    
    // Compound colors
    'navy blue': '#000080',
    'sky blue': '#87ceeb',
    'royal blue': '#4169e1',
    'powder blue': '#b0e0e6',
    'steel blue': '#4682b4',
    'midnight blue': '#191970',
    'baby blue': '#89cff0',
    'electric blue': '#7df9ff',
    'ocean blue': '#006994',
    'ice blue': '#99ddff',
    
    'forest green': '#228b22',
    'lime green': '#32cd32',
    'sea green': '#2e8b57',
    'olive green': '#6b8e23',
    'mint green': '#98ff98',
    'sage green': '#9caf88',
    'emerald green': '#50c878',
    'jade green': '#00a86b',
    'hunter green': '#355e3b',
    'kelly green': '#4cbb17',
    
    'hot pink': '#ff69b4',
    'rose pink': '#ff66cc',
    'baby pink': '#f4c2c2',
    'magenta pink': '#ff1dce',
    'fuchsia pink': '#ff77ff',
    'salmon pink': '#ff91a4',
    'bubble gum pink': '#ffb3de',
    'cotton candy pink': '#ffbcd9',
    
    'golden yellow': '#ffd700',
    'lemon yellow': '#fff44f',
    'canary yellow': '#ffef00',
    'banana yellow': '#ffe135',
    'mustard yellow': '#ffdb58',
    'amber yellow': '#ffbf00',
    'corn yellow': '#fbec5d',
    'cream yellow': '#f5f5dc',
    
    'blood red': '#660000',
    'cherry red': '#de3163',
    'fire red': '#ff2500',
    'brick red': '#cb4154',
    'wine red': '#722f37',
    'ruby red': '#e0115f',
    'rose red': '#ff033e',
    'scarlet red': '#ff2400',
    
    'burnt orange': '#cc5500',
    'peach orange': '#ffcc99',
    'tangerine orange': '#ff8c00',
    'sunset orange': '#ff4500',
    'pumpkin orange': '#ff7518',
    'apricot orange': '#fbceb1',
    'coral orange': '#ff7f50',
    
    'royal purple': '#6a0dad',
    'lavender purple': '#b57edc',
    'violet purple': '#8a2be2',
    'plum purple': '#8e4585',
    'grape purple': '#6f2da8',
    'amethyst purple': '#9966cc',
    'orchid purple': '#da70d6',
    
    // Metallic colors
    'metallic gold': '#d4af37',
    'metallic silver': '#aaa9ad',
    'metallic bronze': '#cd7f32',
    'metallic copper': '#b87333',
    'rose gold': '#e8b4a0',
    'platinum': '#e5e4e2',
    'pewter': '#96a8a1',
    'chrome': '#bfbfbf'
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

  // Comprehensive hobby-to-emoji mapping system with multiple hobby support
  const getHobbyEmojis = (hobby: string) => {
    const hobbyLower = hobby.toLowerCase();
    let allEmojis: string[] = [];
    
    // Helper function to add emojis for a specific category
    const addEmojisForCategory = (keywords: string[], emojis: string[]) => {
      if (keywords.some(keyword => hobbyLower.includes(keyword))) {
        allEmojis.push(...emojis);
      }
    };
    
    // Sports & Physical Activities
    addEmojisForCategory(['soccer', 'football'], ['⚽', '🥅', '🏆']);
    addEmojisForCategory(['basketball'], ['🏀', '⛹️', '🏀']);
    addEmojisForCategory(['tennis'], ['🎾', '🏸', '🎾']);
    addEmojisForCategory(['baseball', 'softball'], ['⚾', '🥎', '⚾']);
    addEmojisForCategory(['volleyball'], ['🏐', '🏐', '🏐']);
    addEmojisForCategory(['golf'], ['⛳', '🏌️', '⛳']);
    addEmojisForCategory(['hockey'], ['🏒', '🥅', '🏒']);
    addEmojisForCategory(['american football'], ['🏈', '🏈', '🏈']);
    addEmojisForCategory(['swimming', 'pool'], ['🏊', '🌊', '🏄']);
    addEmojisForCategory(['running', 'jogging', 'marathon'], ['🏃', '👟', '🏃']);
    addEmojisForCategory(['cycling', 'biking', 'bike'], ['🚴', '🚲', '🚴']);
    addEmojisForCategory(['climbing', 'mountain'], ['🧗', '⛰️', '🧗']);
    addEmojisForCategory(['skiing', 'snowboard'], ['⛷️', '🎿', '⛷️']);
    addEmojisForCategory(['surfing', 'surf'], ['🏄', '🌊', '🏄']);
    addEmojisForCategory(['yoga', 'meditation'], ['🧘', '🕉️', '🧘']);
    addEmojisForCategory(['martial arts', 'karate', 'judo', 'taekwondo'], ['🥋', '👊', '🥋']);
    addEmojisForCategory(['boxing'], ['🥊', '👊', '🥊']);
    addEmojisForCategory(['dance', 'dancing', 'ballet'], ['💃', '🕺', '🎭']);
    
    // Creative Arts
    addEmojisForCategory(['music', 'piano', 'guitar', 'violin', 'drums', 'singing'], ['🎵', '🎶', '🎼']);
    addEmojisForCategory(['art', 'painting', 'drawing', 'sketch'], ['🎨', '🖌️', '✏️']);
    addEmojisForCategory(['photography', 'photo'], ['📷', '📸', '🎞️']);
    addEmojisForCategory(['writing', 'poetry', 'journaling'], ['✍️', '📝', '📖']);
    addEmojisForCategory(['sculpting', 'pottery', 'ceramics'], ['🏺', '🎨', '🏺']);
    addEmojisForCategory(['knitting', 'sewing', 'embroidery', 'crafts'], ['🧶', '✂️', '🪡']);
    addEmojisForCategory(['jewelry', 'beading'], ['💎', '💍', '💎']);
    
    // Technology & Gaming
    addEmojisForCategory(['gaming', 'video games', 'computer games'], ['🎮', '🕹️', '🎮']);
    addEmojisForCategory(['programming', 'coding', 'development'], ['💻', '⌨️', '💻']);
    addEmojisForCategory(['robotics', 'electronics'], ['🤖', '⚡', '🤖']);
    
    // Food & Cooking
    addEmojisForCategory(['cooking', 'baking', 'culinary'], ['👨‍🍳', '🍰', '🥧']);
    addEmojisForCategory(['wine', 'beer', 'brewing'], ['🍷', '🍺', '🍷']);
    addEmojisForCategory(['coffee', 'barista'], ['☕', '☕', '☕']);
    
    // Nature & Outdoors
    addEmojisForCategory(['garden', 'gardening', 'plant'], ['🌱', '🌸', '🌻']);
    addEmojisForCategory(['hiking', 'walking', 'trail'], ['🥾', '🌲', '🥾']);
    addEmojisForCategory(['camping', 'outdoor'], ['🏕️', '🔥', '🏕️']);
    addEmojisForCategory(['fishing'], ['🎣', '🐟', '🎣']);
    addEmojisForCategory(['hunting'], ['🏹', '🦌', '🏹']);
    addEmojisForCategory(['bird watching', 'birding'], ['🦅', '🔭', '🦅']);
    
    // Learning & Reading
    addEmojisForCategory(['reading', 'book'], ['📚', '📖', '📝']);
    addEmojisForCategory(['learning', 'studying', 'education'], ['📚', '🎓', '📚']);
    addEmojisForCategory(['language'], ['🗣️', '📚', '🗣️']);
    
    // Travel & Culture
    addEmojisForCategory(['travel', 'traveling', 'vacation'], ['✈️', '🗺️', '🎒']);
    addEmojisForCategory(['collecting', 'collection'], ['🏆', '💎', '🏆']);
    
    // Games & Puzzles
    addEmojisForCategory(['chess'], ['♟️', '♛', '♟️']);
    addEmojisForCategory(['puzzle', 'crossword', 'sudoku'], ['🧩', '🔍', '🧩']);
    addEmojisForCategory(['board games', 'card games'], ['🎲', '🃏', '🎲']);
    
    // Animals & Pets
    addEmojisForCategory(['pet', 'dog', 'cat', 'animal'], ['🐕', '🐱', '🐕']);
    addEmojisForCategory(['horse', 'riding', 'equestrian'], ['🐎', '🏇', '🐎']);
    
    // Science & Space
    addEmojisForCategory(['astronomy', 'space', 'stars'], ['🔭', '⭐', '🔭']);
    addEmojisForCategory(['science', 'chemistry', 'physics'], ['🔬', '⚗️', '🔬']);
    
    // Health & Wellness
    addEmojisForCategory(['fitness', 'gym', 'workout'], ['💪', '🏋️', '💪']);
    
    // Automotive & Transportation
    addEmojisForCategory(['car', 'automotive', 'racing'], ['🏎️', '🚗', '🏎️']);
    addEmojisForCategory(['motorcycle', 'motorbike'], ['🏍️', '🏍️', '🏍️']);
    
    // Default fallback patterns
    if (allEmojis.length === 0) {
      if (hobbyLower.match(/build|make|create/)) allEmojis.push('🔨', '⚒️', '🔨');
      else if (hobbyLower.match(/watch|view|see/)) allEmojis.push('👀', '📺', '👀');
      else if (hobbyLower.match(/listen|hear|audio/)) allEmojis.push('👂', '🎧', '👂');
      else if (hobbyLower.match(/social|friend|people/)) allEmojis.push('👥', '🤝', '👥');
      else if (hobbyLower.match(/relax|chill|rest/)) allEmojis.push('😌', '🛋️', '😌');
      else allEmojis.push('⭐', '✨', '🎯'); // Ultimate fallback
    }
    
    // Remove duplicates and return unique emojis
    return [...new Set(allEmojis)];
  };

  const getBackgroundImage = () => {
    if (!card.theme) return null;
    
    switch (card.theme) {
      case 'geometric':
        return '/lovable-uploads/b6d6bac9-cbe0-403c-92d3-d931bef709be.png';
      case 'organic':
        return '/lovable-uploads/92562094-6386-421f-8a6e-8066dee1d8b9.png';
      default:
        return null;
    }
  };

  // Determine background style
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

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card 
        className="backdrop-blur-sm border-2 border-art-pink/30 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
        style={getBackgroundStyle()}
      >
        
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
          <h3 className="text-4xl font-fredoka-one text-center mb-4 text-foreground" style={{
            textShadow: '0 0 10px white, 0 0 20px white, 0 0 30px white',
          }}>
            {card.name}
          </h3>

          {/* Attributes with white background for visibility */}
          <div className="space-y-2 text-base bg-white/95 rounded-2xl p-4 backdrop-blur-sm shadow-sm font-sue-ellen">
            {card.relationship && card.relationship.trim() && (
              <div className="flex items-center justify-between">
                <span className={`font-bold ${card.theme === 'organic' ? 'text-green-600' : 'text-blue-600'}`}>Relationship:</span>
                <span className={`capitalize font-semibold ${card.theme === 'organic' ? 'text-yellow-600' : 'text-orange-500'}`}>{card.relationship}</span>
              </div>
            )}
            
            {card.dateOfBirth && (
              <div className="flex items-center justify-between">
                <span className={`font-bold ${card.theme === 'organic' ? 'text-blue-600' : 'text-green-600'}`}>Birthday:</span>
                <span className={`font-semibold ${card.theme === 'organic' ? 'text-red-500' : 'text-red-500'}`}>
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
                <span className={`font-bold ${card.theme === 'organic' ? 'text-red-500' : 'text-purple-600'}`}>Favorite Color:</span>
                <span className={`font-semibold ${card.theme === 'organic' ? 'text-blue-600' : 'text-green-600'}`}>
                  {card.favoriteColor}
                </span>
              </div>
            )}
            
            {card.hobbies && card.hobbies.trim() && (
              <div className="flex items-center justify-between">
                <span className={`font-bold ${card.theme === 'organic' ? 'text-yellow-600' : 'text-orange-500'}`}>Hobbies:</span>
                <span className={`text-right font-semibold ${card.theme === 'organic' ? 'text-green-600' : 'text-blue-600'}`}>{card.hobbies}</span>
              </div>
            )}
            
            {card.funFact && card.funFact.trim() && (
              <div className={`mt-3 p-3 rounded-2xl border-2 ${card.theme === 'organic' ? 'bg-pink-100/80 border-pink-300' : 'bg-yellow-100/80 border-yellow-300'}`}>
                <span className={`font-bold block mb-1 ${card.theme === 'organic' ? 'text-green-700' : 'text-red-600'}`}>Fun Fact:</span>
                <p className={`text-sm leading-relaxed font-medium ${card.theme === 'organic' ? 'text-blue-700' : 'text-purple-700'}`}>{card.funFact}</p>
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
