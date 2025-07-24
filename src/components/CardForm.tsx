import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePositionAdjuster } from "./ImagePositionAdjuster";
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";
import { toast } from 'sonner';

interface CardFormProps {
  initialData?: Partial<FamilyCard>;
  onSubmit: (card: Omit<FamilyCard, 'id'>) => void;
  onCancel?: () => void;
  onPreviewChange?: (card: Partial<FamilyCard>) => void;
  isEditing?: boolean;
  deckTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  deckFont?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
  onUploadImage?: (file: File) => Promise<string | null>;
}

export const CardForm = ({ initialData = {}, onSubmit, onCancel, onPreviewChange, isEditing = false, deckTheme, deckFont, onUploadImage }: CardFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<FamilyCard>>({
    name: '',
    photo: '',
    relationship: '',
    dateOfBirth: '',
    favoriteColor: '',
    hobbies: '',
    funFact: '',
    imagePosition: { x: 0, y: 0, scale: 1 },
    ...initialData
  });

  // Only update form data when we're switching to edit mode or resetting
  useEffect(() => {
    if (isEditing || Object.keys(initialData).length === 0) {
      setFormData({
        name: '',
        photo: '',
        relationship: '',
        dateOfBirth: '',
        favoriteColor: '',
        hobbies: '',
        funFact: '',
        imagePosition: { x: 0, y: 0, scale: 1 },
        ...initialData
      });
    }
  }, [isEditing, initialData]);

  // Send preview data with deck theme/font for real-time preview updates
  useEffect(() => {
    if (onPreviewChange) {
      const displayData = {
        ...formData,
        theme: deckTheme,
        font: deckFont
      };
      onPreviewChange(displayData);
    }
  }, [formData, onPreviewChange, deckTheme, deckFont]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check all required fields
    const requiredFields = {
      name: formData.name?.trim() || '',
      photo: formData.photo || '',
      relationship: formData.relationship?.trim() || '',
      dateOfBirth: formData.dateOfBirth || '',
      favoriteColor: formData.favoriteColor?.trim() || '',
      hobbies: formData.hobbies?.trim() || '',
      funFact: formData.funFact?.trim() || ''
    };
    
    // Check if any required field is empty
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      // Focus on the first missing field
      const fieldMap: Record<string, string> = {
        name: 'name',
        photo_url: 'photo',
        relationship: 'relationship',
        dateOfBirth: 'dateOfBirth',
        favoriteColor: 'favoriteColor',
        hobbies: 'hobbies',
        funFact: 'funFact'
      };
      
      const firstMissingField = fieldMap[missingFields[0]];
      const element = document.getElementById(firstMissingField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Use deck theme and font for final submission
    const finalData = {
      ...formData,
      theme: deckTheme,
      font: deckFont
    } as Omit<FamilyCard, 'id'>;
    
    onSubmit(finalData);
    
    if (!isEditing) {
      setFormData({
        name: '',
        photo: '',
        relationship: '',
        dateOfBirth: '',
        favoriteColor: '',
        hobbies: '',
        funFact: '',
        imagePosition: { x: 0, y: 0, scale: 1 },
      });
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      setUploading(true);
      try {
        const photoUrl = await onUploadImage(file);
        if (photoUrl) {
          setFormData(prev => ({ 
            ...prev, 
            photo: photoUrl,
            imagePosition: { x: 0, y: 0, scale: 1 } // Reset position when new image is uploaded
          }));
          toast.success('Image uploaded successfully!');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
      } finally {
        setUploading(false);
      }
      // Clear the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  // Function to remove the uploaded image
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

  // Function to trigger file input for image replacement
  const handleReplaceImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePositionChange = useCallback((position: { x: number; y: number; scale: number }) => {
    setFormData(prev => ({ ...prev, imagePosition: position }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name (Uncle Stu, Granny, Cousin Tom) *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter name"
          required
        />
      </div>

      <div>
        <Label htmlFor="photo">Photo *</Label>
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            key={formData.photo ? 'has-photo' : 'no-photo'} // Force re-render when photo changes
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            required={!formData.photo}
            disabled={uploading}
            className="h-12 flex items-center py-1.5 file:mr-4 file:my-0 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-art-pink/20 file:text-art-pink hover:file:bg-art-pink/30"
          />
          {uploading && (
            <div className="flex items-center text-sm text-blue-600 p-2">
              <span>Uploading image...</span>
            </div>
          )}
          {formData.photo && !uploading && (
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
          {!formData.photo && !uploading && (
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
              initialPosition={formData.imagePosition || { x: 0, y: 0, scale: 1 }}
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="relationship">Where they live *</Label>
        <Input
          id="relationship"
          value={formData.relationship || ''}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          placeholder="e.g., New York, California, Down the street, Next door"
          required
        />
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Birthday (Month & Day) *</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={(formData.dateOfBirth || '').split('-')[1] || ''}
              onChange={(e) => {
                const day = (formData.dateOfBirth || '').split('-')[2] || '01';
                setFormData({ ...formData, dateOfBirth: `2000-${e.target.value.padStart(2, '0')}-${day}` });
              }}
              required
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
              value={(formData.dateOfBirth || '').split('-')[2] || ''}
              onChange={(e) => {
                const month = (formData.dateOfBirth || '').split('-')[1] || '01';
                setFormData({ ...formData, dateOfBirth: `2000-${month}-${e.target.value.padStart(2, '0')}` });
              }}
              required
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
        <Label htmlFor="favoriteColor">Favorite Color *</Label>
        <Input
          id="favoriteColor"
          value={formData.favoriteColor || ''}
          onChange={(e) => setFormData({ ...formData, favoriteColor: e.target.value })}
          placeholder="e.g., Blue, Red, Green"
          required
        />
      </div>

      <div>
        <Label htmlFor="hobbies">Hobbies *</Label>
        <Input
          id="hobbies"
          value={formData.hobbies || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 30) {
              setFormData({ ...formData, hobbies: value });
            }
          }}
          placeholder="e.g., Reading, Cooking, Gardening"
          maxLength={30}
          required
        />
        <div className="flex justify-end items-center mt-1">
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${(formData.hobbies?.length || 0) >= 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {formData.hobbies?.length || 0}/30
            </span>
            {(formData.hobbies?.length || 0) >= 30 && (
              <span className="text-xs text-destructive">Character limit reached</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="funFact">Fun Fact *</Label>
        <Textarea
          id="funFact"
          value={formData.funFact || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 80) {
              setFormData({ ...formData, funFact: value });
            }
          }}
          placeholder="Something interesting or fun about this person"
          rows={3}
          maxLength={80}
          required
        />
        <div className="flex justify-end items-center mt-1">
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${(formData.funFact?.length || 0) >= 80 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {formData.funFact?.length || 0}/80
            </span>
            {(formData.funFact?.length || 0) >= 80 && (
              <span className="text-xs text-destructive">Character limit reached</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button 
          type="submit" 
          disabled={uploading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 font-bold uppercase text-sm tracking-wide"
        >
          {uploading ? 'Uploading...' : (isEditing ? 'Update Card' : 'Add Card')}
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