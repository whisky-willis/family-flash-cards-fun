export interface FormattingPreset {
  id: string;
  name: string;
  description: string;
  theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  font: 'fredoka' | 'comic-neue' | 'bubblegum' | 'kalam' | 'pangolin' | 'boogaloo' | 'luckiest-guy';
  primaryColor: string;
  accentColor: string;
}

export const FORMATTING_PRESETS: FormattingPreset[] = [
  {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    description: 'Timeless geometric patterns with clean typography',
    theme: 'geometric',
    font: 'fredoka',
    primaryColor: 'art-blue',
    accentColor: 'art-pink'
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean lines with contemporary font styling',
    theme: 'mosaic',
    font: 'comic-neue',
    primaryColor: 'art-green',
    accentColor: 'art-yellow'
  },
  {
    id: 'warm-family',
    name: 'Warm Family',
    description: 'Organic shapes with friendly, approachable fonts',
    theme: 'organic',
    font: 'bubblegum',
    primaryColor: 'art-orange',
    accentColor: 'art-red'
  },
  {
    id: 'playful-rainbow',
    name: 'Playful Rainbow',
    description: 'Vibrant colors perfect for children and fun personalities',
    theme: 'rainbow',
    font: 'luckiest-guy',
    primaryColor: 'art-pink',
    accentColor: 'art-yellow'
  },
  {
    id: 'adventure-space',
    name: 'Adventure Space',
    description: 'Cosmic themes for dreamers and explorers',
    theme: 'space',
    font: 'boogaloo',
    primaryColor: 'art-blue',
    accentColor: 'art-green'
  },
  {
    id: 'active-sports',
    name: 'Active Sports',
    description: 'Dynamic patterns for athletic family members',
    theme: 'sports',
    font: 'kalam',
    primaryColor: 'art-red',
    accentColor: 'art-orange'
  },
  {
    id: 'artistic-expression',
    name: 'Artistic Expression',
    description: 'Creative mosaic patterns with expressive typography',
    theme: 'mosaic',
    font: 'pangolin',
    primaryColor: 'art-pink',
    accentColor: 'art-blue'
  },
  {
    id: 'gentle-nature',
    name: 'Gentle Nature',
    description: 'Soft organic flows with calm, readable fonts',
    theme: 'organic',
    font: 'fredoka',
    primaryColor: 'art-green',
    accentColor: 'art-yellow'
  },
  {
    id: 'bold-statement',
    name: 'Bold Statement',
    description: 'Strong geometric patterns with impactful typography',
    theme: 'geometric',
    font: 'luckiest-guy',
    primaryColor: 'art-red',
    accentColor: 'art-orange'
  },
  {
    id: 'joyful-celebration',
    name: 'Joyful Celebration',
    description: 'Rainbow themes with festive, cheerful fonts',
    theme: 'rainbow',
    font: 'bubblegum',
    primaryColor: 'art-yellow',
    accentColor: 'art-pink'
  }
];

export const getPresetById = (id: string): FormattingPreset | undefined => {
  return FORMATTING_PRESETS.find(preset => preset.id === id);
};