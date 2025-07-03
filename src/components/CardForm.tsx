import React, { useState, useEffect } from 'react';
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
  }, [isEditing]); // Only depend on isEditing, not initialData

  // Call onChange whenever formData changes, but only if onChange exists
  useEffect(() => {
    onChange?.(formData);
  }, [formData]); // Removed onChange from dependencies to prevent infinite loop

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit(formData);
    
    if (!isEditing) {
      setFormData({
        name: '',
        photo: '',
        dateOfBirth: '',
        favoriteColor: '',
        hobbies: '',
        funFact: '',
        relationship: '',
        imagePosition: { x: 0, y: 0, scale: 1 },
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ 
          ...formData, 
          photo: e.target?.result as string,
          imagePosition: { x: 0, y: 0, scale: 1 } // Reset position when new image is uploaded
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePositionChange = (position: { x: number; y: number; scale: number }) => {
    setFormData({ ...formData, imagePosition: position });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
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
        <Input
          id="photo"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="flex items-center h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-art-pink/20 file:text-art-pink hover:file:bg-art-pink/30 file:align-middle"
        />
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
