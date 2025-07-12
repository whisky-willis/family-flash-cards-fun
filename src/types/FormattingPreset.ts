export interface FormattingPreset {
  id: string;
  name: string;
  description: string;
  theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  font: 'bubblegum' | 'luckiest-guy';
  primaryColor: string;
  accentColor: string;
}

export const FORMATTING_PRESETS: FormattingPreset[] = [
  {
    id: 'confetti-playful',
    name: 'Confetti Playful',
    description: 'Geometric confetti patterns with fun, bubbly typography',
    theme: 'geometric',
    font: 'bubblegum',
    primaryColor: 'art-pink',
    accentColor: 'art-yellow'
  },
  {
    id: 'confetti-bold',
    name: 'Confetti Bold',
    description: 'Dynamic confetti background with strong, impactful text',
    theme: 'geometric',
    font: 'luckiest-guy',
    primaryColor: 'art-red',
    accentColor: 'art-orange'
  },
  {
    id: 'lava-lamp-sweet',
    name: 'Lava Lamp Sweet',
    description: 'Organic flowing shapes with friendly, approachable fonts',
    theme: 'organic',
    font: 'bubblegum',
    primaryColor: 'art-orange',
    accentColor: 'art-red'
  },
  {
    id: 'lava-lamp-strong',
    name: 'Lava Lamp Strong',
    description: 'Flowing organic patterns with bold, confident typography',
    theme: 'organic',
    font: 'luckiest-guy',
    primaryColor: 'art-green',
    accentColor: 'art-blue'
  },
  {
    id: 'rainbow-cheerful',
    name: 'Rainbow Cheerful',
    description: 'Vibrant rainbow colors with playful, bubbly text',
    theme: 'rainbow',
    font: 'bubblegum',
    primaryColor: 'art-yellow',
    accentColor: 'art-pink'
  },
  {
    id: 'rainbow-festive',
    name: 'Rainbow Festive',
    description: 'Colorful rainbow theme with celebratory, fun typography',
    theme: 'rainbow',
    font: 'luckiest-guy',
    primaryColor: 'art-pink',
    accentColor: 'art-yellow'
  },
  {
    id: 'mosaic-artistic',
    name: 'Mosaic Artistic',
    description: 'Creative mosaic patterns with soft, rounded typography',
    theme: 'mosaic',
    font: 'bubblegum',
    primaryColor: 'art-blue',
    accentColor: 'art-green'
  },
  {
    id: 'mosaic-creative',
    name: 'Mosaic Creative',
    description: 'Artistic mosaic design with expressive, bold lettering',
    theme: 'mosaic',
    font: 'luckiest-guy',
    primaryColor: 'art-green',
    accentColor: 'art-orange'
  },
  {
    id: 'space-dreamy',
    name: 'Space Dreamy',
    description: 'Cosmic space theme with gentle, floating typography',
    theme: 'space',
    font: 'bubblegum',
    primaryColor: 'art-blue',
    accentColor: 'art-pink'
  },
  {
    id: 'space-adventure',
    name: 'Space Adventure',
    description: 'Galactic exploration theme with bold, heroic fonts',
    theme: 'space',
    font: 'luckiest-guy',
    primaryColor: 'art-blue',
    accentColor: 'art-red'
  },
  {
    id: 'sports-fun',
    name: 'Sports Fun',
    description: 'Athletic patterns with friendly, approachable typography',
    theme: 'sports',
    font: 'bubblegum',
    primaryColor: 'art-green',
    accentColor: 'art-yellow'
  },
  {
    id: 'sports-champion',
    name: 'Sports Champion',
    description: 'Dynamic sports theme with winning, powerful lettering',
    theme: 'sports',
    font: 'luckiest-guy',
    primaryColor: 'art-red',
    accentColor: 'art-orange'
  }
];

export const getPresetById = (id: string): FormattingPreset | undefined => {
  return FORMATTING_PRESETS.find(preset => preset.id === id);
};