import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Palette, Settings } from "lucide-react";
import { FormattingPreset, FORMATTING_PRESETS, getPresetById } from "@/types/FormattingPreset";
import { cn } from "@/lib/utils";

interface FormattingPresetSelectorProps {
  selectedPresetId?: string;
  selectedTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  selectedFont?: 'fredoka' | 'comic-neue' | 'bubblegum' | 'kalam' | 'pangolin' | 'boogaloo' | 'luckiest-guy';
  onPresetSelect: (preset: FormattingPreset) => void;
  onThemeChange?: (theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports') => void;
  onFontChange?: (font: 'fredoka' | 'comic-neue' | 'bubblegum' | 'kalam' | 'pangolin' | 'boogaloo' | 'luckiest-guy') => void;
}

export const FormattingPresetSelector = ({
  selectedPresetId,
  selectedTheme,
  selectedFont,
  onPresetSelect,
  onThemeChange,
  onFontChange
}: FormattingPresetSelectorProps) => {
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [isGridView, setIsGridView] = useState(true);

  const selectedPreset = selectedPresetId ? getPresetById(selectedPresetId) : undefined;

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
      default: return 'font-fredoka';
    }
  };

  // Function to get background image for themes
  const getBackgroundImage = (theme: string) => {
    switch (theme) {
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

  // Preset Preview Component
  const PresetPreview = ({ preset, isSelected }: { preset: FormattingPreset; isSelected: boolean }) => {
    const backgroundImage = getBackgroundImage(preset.theme);
    const fontClass = getFontClass(preset.font);

    return (
      <button
        onClick={() => onPresetSelect(preset)}
        className={cn(
          "w-full text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-art-pink focus:ring-offset-2 rounded-xl",
          isSelected ? "ring-2 ring-art-pink ring-offset-2" : "hover:scale-105"
        )}
      >
        <Card className={cn(
          "overflow-hidden border-2 transition-all duration-200",
          isSelected ? "border-art-pink shadow-lg" : "border-gray-200 hover:border-art-pink/50 hover:shadow-md"
        )}>
          <CardContent className="p-0">
            {/* Preview Area */}
            <div 
              className="h-24 md:h-28 relative overflow-hidden"
              style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                  <span className={cn(fontClass, "text-lg md:text-xl font-bold text-gray-800")}>
                    Sample
                  </span>
                </div>
              </div>
            </div>
            
            {/* Info Area */}
            <div className="p-3">
              <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1">
                {preset.name}
              </h4>
              <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
                {preset.description}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="capitalize">{preset.theme}</span>
                <span className="capitalize">{preset.font.replace('-', ' ')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5 text-art-pink" />
          Formatting Preset
        </Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsGridView(!isGridView)}
            className="h-8 px-3 text-xs"
          >
            {isGridView ? 'List' : 'Grid'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedMode(!showAdvancedMode)}
            className="h-8 px-3 text-xs flex items-center gap-1"
          >
            <Settings className="h-3 w-3" />
            Advanced
          </Button>
        </div>
      </div>

      {/* Preset Selection */}
      {isGridView ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {FORMATTING_PRESETS.map((preset) => (
            <PresetPreview
              key={preset.id}
              preset={preset}
              isSelected={selectedPresetId === preset.id}
            />
          ))}
        </div>
      ) : (
        <Select value={selectedPresetId || ''} onValueChange={(value) => {
          const preset = getPresetById(value);
          if (preset) onPresetSelect(preset);
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a formatting preset">
              {selectedPreset && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border-2 border-white shadow-sm"
                    style={{
                      backgroundImage: getBackgroundImage(selectedPreset.theme) 
                        ? `url(${getBackgroundImage(selectedPreset.theme)})` 
                        : 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="text-left">
                    <div className="font-medium">{selectedPreset.name}</div>
                    <div className="text-xs text-gray-500">{selectedPreset.description}</div>
                  </div>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FORMATTING_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                <div className="flex items-center gap-3 py-1">
                  <div 
                    className="w-8 h-8 rounded border-2 border-white shadow-sm flex-shrink-0"
                    style={{
                      backgroundImage: getBackgroundImage(preset.theme) 
                        ? `url(${getBackgroundImage(preset.theme)})` 
                        : 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="text-left min-w-0">
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-500 truncate">{preset.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Advanced Mode - Separate Theme and Font Controls */}
      {showAdvancedMode && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced Customization
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme-override" className="text-sm font-medium">
                Override Theme
              </Label>
              <Select 
                value={selectedTheme || ''} 
                onValueChange={(value: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports') => {
                  onThemeChange?.(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geometric">Confetti</SelectItem>
                  <SelectItem value="organic">Lava Lamp</SelectItem>
                  <SelectItem value="rainbow">Rainbow</SelectItem>
                  <SelectItem value="mosaic">Mosaic</SelectItem>
                  <SelectItem value="space">Space</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="font-override" className="text-sm font-medium">
                Override Font
              </Label>
              <Select 
                value={selectedFont || ''} 
                onValueChange={(value: 'fredoka' | 'comic-neue' | 'bubblegum' | 'kalam' | 'pangolin' | 'boogaloo' | 'luckiest-guy') => {
                  onFontChange?.(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fredoka">Fredoka</SelectItem>
                  <SelectItem value="comic-neue">Comic Neue</SelectItem>
                  <SelectItem value="bubblegum">Bubblegum Sans</SelectItem>
                  <SelectItem value="kalam">Kalam</SelectItem>
                  <SelectItem value="pangolin">Pangolin</SelectItem>
                  <SelectItem value="boogaloo">Boogaloo</SelectItem>
                  <SelectItem value="luckiest-guy">Luckiest Guy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <p className="text-xs text-gray-600">
            Advanced mode allows you to override individual theme and font settings while keeping the preset as a starting point.
          </p>
        </div>
      )}

      {/* Selected Preset Info */}
      {selectedPreset && (
        <div className="p-3 bg-art-pink/10 rounded-lg border border-art-pink/20">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg border-2 border-white shadow-sm"
              style={{
                backgroundImage: getBackgroundImage(selectedPreset.theme) 
                  ? `url(${getBackgroundImage(selectedPreset.theme)})` 
                  : 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div>
              <div className="font-semibold text-art-pink text-sm">
                {selectedPreset.name} Selected
              </div>
              <div className="text-xs text-gray-600">
                {selectedPreset.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};