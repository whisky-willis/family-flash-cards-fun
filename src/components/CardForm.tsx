import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePositionAdjuster } from "./ImagePositionAdjuster";
import { FamilyCard } from "@/pages/CreateCards";

interface CardFormProps {
  initialData?: Partial<FamilyCard>;
  onSubmit: (card: Omit<FamilyCard, 'id'>) => void;
  onCancel?: () => void;
  onChange?: (card: Partial<FamilyCard>) => void;
  isEditing?: boolean;
}

export const CardForm = ({ initialData = {}, onSubmit, onCancel, onChange, isEditing = false }: CardFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    dateOfBirth: '',
    favoriteColor: '',
    hobbies: '',
    funFact: '',
    relationship: '',
    imagePosition: { x: 0, y: 0, scale: 1 },
    ...initialData
  });

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
        relationship: '',
        imagePosition: { x: 0, y: 0, scale: 1 },
        ...initialData
      });
    }
  }, [isEditing, initialData]); // Fixed: Added initialData dependency

  // Call onChange whenever formData changes, but only if onChange exists
  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]); // Fixed: Added onChange back but it should be memoized by parent

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit(formData);
    
    if (!isEditing) {
      setFormData(prev => ({
        name: '',
        photo: '',
        dateOfBirth: '',
        favoriteColor: '',
        hobbies: '',
        funFact: '',
        relationship: '',
        imagePosition: { x: 0, y: 0, scale: 1 },
      }));
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
  }, []); // Fixed: Memoized the callback to prevent infinite re-renders

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
        <Label htmlFor="relationship">Relationship</Label>
        <Input
          id="relationship"
          value={formData.relationship}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          placeholder="e.g., Daddy, Mommy, Nanna, Grandpa, Uncle Tom"
        />
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        />
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
        <Label htmlFor="hobbies">Hobbies</Label>
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
