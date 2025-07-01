
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import { FamilyCard } from "@/pages/CreateCards";

interface CardPreviewProps {
  card: Partial<FamilyCard>;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const CardPreview = ({ card, onEdit, onDelete, showActions = false }: CardPreviewProps) => {
  // Check if card has any meaningful data
  const hasData = card.name && card.name.trim().length > 0;

  if (!hasData) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <Card className="bg-gradient-to-br from-pink-100 to-blue-100 border-2 border-dashed border-gray-300">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Fill in the form to see your card preview</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="bg-gradient-to-br from-pink-100 to-blue-100 border-2 border-pink-200 shadow-lg">
        <CardContent className="p-6">
          {/* Photo Section */}
          <div className="text-center mb-4">
            {card.photo ? (
              <div className="px-4">
                <img 
                  src={card.photo} 
                  alt={card.name}
                  className="w-full object-cover rounded-lg border-4 border-white shadow-md"
                  style={{ height: '180px' }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto border-4 border-white shadow-md flex items-center justify-center">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
            {card.name}
          </h3>

          {/* Attributes */}
          <div className="space-y-2 text-sm">
            {card.relationship && card.relationship.trim() && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Relationship:</span>
                <span className="text-gray-800 capitalize">{card.relationship}</span>
              </div>
            )}
            
            {card.dateOfBirth && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Birthday:</span>
                <span className="text-gray-800">
                  {new Date(card.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {card.favoriteColor && card.favoriteColor.trim() && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Favorite Color:</span>
                <span className="text-gray-800">{card.favoriteColor}</span>
              </div>
            )}
            
            {card.hobbies && card.hobbies.trim() && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Hobbies:</span>
                <span className="text-gray-800 text-right">{card.hobbies}</span>
              </div>
            )}
            
            {card.funFact && card.funFact.trim() && (
              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                <span className="font-semibold text-gray-600 block mb-1">Fun Fact:</span>
                <p className="text-gray-800 text-xs leading-relaxed">{card.funFact}</p>
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
                className="flex-1 border-pink-300 hover:bg-pink-50"
              >
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDelete}
                className="flex-1 border-red-300 hover:bg-red-50 text-red-600"
              >
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Brand */}
      <div className="text-center mt-2">
        <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
          <Heart className="h-3 w-3" />
          <span>FamilyCards</span>
        </div>
      </div>
    </div>
  );
};
