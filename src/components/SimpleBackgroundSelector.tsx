import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleBackgroundSelectorProps {
  selectedTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  onThemeChange: (theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports') => void;
}

const THEMES = [
  {
    id: 'geometric' as const,
    name: 'Confetti',
    description: 'Playful geometric patterns',
    image: '/lovable-uploads/b6d6bac9-cbe0-403c-92d3-d931bef709be.png',
    colors: ['art-pink', 'art-yellow']
  },
  {
    id: 'organic' as const,
    name: 'Lava Lamp',
    description: 'Flowing organic shapes',
    image: '/lovable-uploads/92562094-6386-421f-8a6e-8066dee1d8b9.png',
    colors: ['art-orange', 'art-red']
  },
  {
    id: 'rainbow' as const,
    name: 'Rainbow',
    description: 'Vibrant rainbow colors',
    image: '/lovable-uploads/218e023d-f5aa-4d6b-ad30-fe4544c295d4.png',
    colors: ['art-pink', 'art-yellow']
  },
  {
    id: 'mosaic' as const,
    name: 'Mosaic',
    description: 'Artistic mosaic patterns',
    image: '/lovable-uploads/473f2252-c157-4af5-8dce-4d10b6e0191a.png',
    colors: ['art-blue', 'art-green']
  },
  {
    id: 'space' as const,
    name: 'Space',
    description: 'Cosmic space themes',
    image: '/lovable-uploads/a5f11a82-3c49-41b7-a0fc-7c2d29fdcda9.png',
    colors: ['art-blue', 'art-pink']
  },
  {
    id: 'sports' as const,
    name: 'Sports',
    description: 'Dynamic athletic patterns',
    image: '/lovable-uploads/73e0e4f2-881f-4259-82b5-0cc0a112eae5.png',
    colors: ['art-red', 'art-orange']
  }
];

export const SimpleBackgroundSelector = ({
  selectedTheme,
  onThemeChange,
}: SimpleBackgroundSelectorProps) => {
  const [hoveredTheme, setHoveredTheme] = useState<'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports' | null>(null);

  const handleThemeSelect = (theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports') => {
    onThemeChange(theme);
    setHoveredTheme(null);
  };

  const handleMouseLeave = () => {
    setHoveredTheme(null);
  };

  return (
    <div className="space-y-6">
      {/* Background Theme Grid */}
      <div>
        <Label className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Image className="h-5 w-5 text-art-blue" />
          Choose Your Background
        </Label>
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          onMouseLeave={handleMouseLeave}
        >
          {THEMES.map((theme) => (
            <button
              type="button"
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              onMouseEnter={() => setHoveredTheme(theme.id)}
              className={cn(
                "text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-art-pink focus:ring-offset-2 rounded-xl",
                "hover:scale-105 hover:shadow-lg"
              )}
            >
              <Card className={cn(
                "overflow-hidden border-2 transition-all duration-200",
                selectedTheme === theme.id
                  ? "border-art-pink shadow-lg ring-2 ring-art-pink ring-offset-2"
                  : "border-gray-200 hover:border-art-pink/50",
                hoveredTheme === theme.id && "border-art-blue ring-2 ring-art-blue ring-offset-2"
              )}>
                <CardContent className="p-0">
                  {/* Background Preview */}
                  <div
                    className="h-20 md:h-24 relative overflow-hidden"
                    style={{
                      backgroundImage: `url(${theme.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
                        <span className="text-sm font-bold text-gray-800">
                          {theme.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="p-3">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                      {theme.name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {theme.description}
                    </p>

                    {/* Selection Indicator */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {theme.colors.map((color, index) => (
                          <div
                            key={index}
                            className={cn(
                              "w-3 h-3 rounded-full",
                              color === 'art-pink' && 'bg-art-pink',
                              color === 'art-blue' && 'bg-art-blue',
                              color === 'art-green' && 'bg-art-green',
                              color === 'art-orange' && 'bg-art-orange',
                              color === 'art-red' && 'bg-art-red',
                              color === 'art-yellow' && 'bg-art-yellow'
                            )}
                          />
                        ))}
                      </div>
                      {selectedTheme === theme.id && (
                        <div className="text-art-pink text-xs font-bold">
                          Selected
                        </div>
                      )}
                      {hoveredTheme === theme.id && selectedTheme !== theme.id && (
                        <div className="text-art-blue text-xs font-bold">
                          Preview
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {/* Current Selection Summary */}
      {selectedTheme && (
        <div className="p-4 bg-art-pink/10 rounded-lg border border-art-pink/20">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg border-2 border-white shadow-sm"
              style={{
                backgroundImage: `url(${THEMES.find(t => t.id === selectedTheme)?.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div>
              <div className="font-semibold text-art-pink text-sm">
                {THEMES.find(t => t.id === selectedTheme)?.name} Background
              </div>
              <div className="text-xs text-gray-600">
                {THEMES.find(t => t.id === selectedTheme)?.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
