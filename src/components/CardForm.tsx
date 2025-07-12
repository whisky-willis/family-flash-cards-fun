import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePositionAdjuster } from "./ImagePositionAdjuster";
import { BackgroundThemeSelector } from "./BackgroundThemeSelector";
import { FamilyCard } from "@/pages/CreateCards";

interface CardFormProps {
  initialData?: Partial<FamilyCard>;
  onSubmit: (card: Omit<FamilyCard, 'id'>) => void;
  onCancel?: () => void;
  onPreviewChange?: (card: Partial<FamilyCard>) => void;
  isEditing?: boolean;
}

export const CardForm = ({ initialData = {}, onSubmit, onCancel, onPreviewChange, isEditing = false }: CardFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    dateOfBirth: '',
    favoriteColor: '',
    hobbies: '',
    funFact: '',
    whereTheyLive: '',
    theme: undefined as 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports' | undefined,
    font: undefined as 'bubblegum' | 'luckiest-guy' | undefined,
    imagePosition: { x: 0, y: 0, scale: 1 },
    ...initialData
  });

  // Preview state for hover effects
  const [previewData, setPreviewData] = useState<{
    theme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
    font?: 'bubblegum' | 'luckiest-guy';
  }>({});

  // Only update form data when we're switching to edit mode or resetting
  useEffect(() => {
    if (isEditing || Object.keys(initialData).length === 0) {
      setFormData({
        name: '',
        photo: '',
        dateOfBirth: '',
        favoriteColor: '',
        hobbies: '',
        funFact: '',
        whereTheyLive: '',
        theme: undefined as 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports' | undefined,
        font: undefined as 'bubblegum' | 'luckiest-guy' | undefined,
        imagePosition: { x: 0, y: 0, scale: 1 },
        ...initialData
      });
      
      // Initialize preview data with theme/font from initialData when editing
      if (isEditing && initialData) {
        setPreviewData({
          theme: initialData.theme,
          font: initialData.font
        });
      } else {
        setPreviewData({});
      }
    }
  }, [isEditing, initialData]);

  // Only send preview data for real-time preview updates
  useEffect(() => {
    if (onPreviewChange) {
      const displayData = {
        ...formData,
        ...(previewData.theme && { theme: previewData.theme }),
        ...(previewData.font && { font: previewData.font })
      };
      onPreviewChange(displayData);
    }
  }, [formData, previewData, onPreviewChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    // Merge formData with preview data for final submission
    const finalData = {
      ...formData,
      ...(previewData.theme && { theme: previewData.theme }),
      ...(previewData.font && { font: previewData.font })
    };
    
    onSubmit(finalData);
    
    if (!isEditing) {
      setFormData(prev => ({
        name: '',
        photo: '',
        dateOfBirth: '',
        favoriteColor: '',
        hobbies: '',
        funFact: '',
        whereTheyLive: '',
        theme: undefined as 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports' | undefined,
        font: undefined as 'bubblegum' | 'luckiest-guy' | undefined,
        imagePosition: { x: 0, y: 0, scale: 1 },
      }));
      // Reset preview data after successful submission
      setPreviewData({});
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ 
          ...prev, 
          photo: event.target?.result as string,
          imagePosition: { x: 0, y: 0, scale: 1 } // Reset position when new image is uploaded
        }));
      };
      reader.readAsDataURL(file);
      // Clear the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  // Added: Function to remove the uploaded image
  const handleRemoveImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      photo: '',
      imagePosition: { x: 0, y: 0, scale: 1 }
    }));
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Added: Function to trigger file input for image replacement
  const handleReplaceImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePositionChange = useCallback((position: { x: number; y: number; scale: number }) => {
    setFormData(prev => ({ ...prev, imagePosition: position }));
  }, []);

  // Handler for theme selection - NO formData updates, only for final submission
  const handleThemeChange = useCallback((theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports') => {
    // DON'T update formData here to prevent auto-save
    // Only update preview data - formData will be updated on submit
    setPreviewData(prev => ({ ...prev, theme }));
  }, []);

  // Handler for font selection - NO formData updates, only for final submission  
  const handleFontChange = useCallback((font: 'bubblegum' | 'luckiest-guy') => {
    // DON'T update formData here to prevent auto-save
    // Only update preview data - formData will be updated on submit
    setPreviewData(prev => ({ ...prev, font }));
  }, []);

  // Handler for preview changes when hovering
  const handlePreviewChange = useCallback((theme: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports', font: 'bubblegum' | 'luckiest-guy') => {
    setPreviewData({ theme, font });
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name (Uncle Stu, Granny, Cousin Tom) *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter name"
          required
        />
      </div>

      <div>
        <Label htmlFor="photo">Photo</Label>
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            key={formData.photo ? 'has-photo' : 'no-photo'} // Force re-render when photo changes
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="h-12 flex items-center py-1.5 file:mr-4 file:my-0 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-art-pink/20 file:text-art-pink hover:file:bg-art-pink/30"
          />
          {formData.photo && (
            <div className="flex justify-between items-center text-sm bg-green-50 border border-green-200 rounded-lg p-2">
              <span className="text-green-700 font-medium">✓ Image uploaded successfully</span>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReplaceImage}
                  className="h-8 px-3 text-xs border-art-blue text-art-blue hover:bg-art-blue hover:text-white"
                >
                  Replace Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="h-8 px-3 text-xs border-art-red text-art-red hover:bg-art-red hover:text-white"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
          {!formData.photo && (
            <p className="text-sm text-muted-foreground">Upload a photo to get started</p>
          )}
        </div>
        {formData.photo && (
          <div className="mt-3">
            <Label className="text-sm text-muted-foreground mb-2 block font-medium">Adjust Image Position</Label>
            <ImagePositionAdjuster
              imageSrc={formData.photo}
              alt={formData.name || "Preview"}
              onPositionChange={handlePositionChange}
              initialPosition={formData.imagePosition}
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="whereTheyLive">Where they live</Label>
        <Input
          id="whereTheyLive"
          value={formData.whereTheyLive}
          onChange={(e) => setFormData({ ...formData, whereTheyLive: e.target.value })}
          placeholder="e.g., New York, California, Down the street, Next door"
        />
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Birthday (Month & Day)</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.dateOfBirth.split('-')[1] || ''}
              onChange={(e) => {
                const day = formData.dateOfBirth.split('-')[2] || '01';
                setFormData({ ...formData, dateOfBirth: `2000-${e.target.value.padStart(2, '0')}-${day}` });
              }}
            >
              <option value="">Month</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.dateOfBirth.split('-')[2] || ''}
              onChange={(e) => {
                const month = formData.dateOfBirth.split('-')[1] || '01';
                setFormData({ ...formData, dateOfBirth: `2000-${month}-${e.target.value.padStart(2, '0')}` });
              }}
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day.toString().padStart(2, '0')}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="favoriteColor">Favorite Color</Label>
        <Input
          id="favoriteColor"
          value={formData.favoriteColor}
          onChange={(e) => setFormData({ ...formData, favoriteColor: e.target.value })}
          placeholder="e.g., Blue, Red, Green"
        />
      </div>

      <div>
        <Label htmlFor="hobbies">Hobbies (list 1-3 hobbies)</Label>
        <Input
          id="hobbies"
          value={formData.hobbies}
          onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
          placeholder="e.g., Reading, Cooking, Gardening"
        />
      </div>

      <div>
        <Label htmlFor="funFact">Fun Fact</Label>
        <Textarea
          id="funFact"
          value={formData.funFact}
          onChange={(e) => setFormData({ ...formData, funFact: e.target.value })}
          placeholder="Something interesting or fun about this person"
          rows={3}
        />
      </div>

      <BackgroundThemeSelector
        selectedTheme={previewData.theme || formData.theme}
        selectedFont={previewData.font || formData.font}
        onThemeChange={handleThemeChange}
        onFontChange={handleFontChange}
        onPreviewChange={handlePreviewChange}
      />

      <div className="flex space-x-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 font-bold uppercase text-sm tracking-wide">
          {isEditing ? 'Update Card' : 'Add Card'}
        </Button>
        {isEditing && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase text-sm tracking-wide">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
