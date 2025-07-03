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
        <Card className="bg-art-yellow/20 border-2 border-dashed border-art-yellow/50 rounded-3xl">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-art-yellow mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Fill in the form to see your card preview</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-pink/30 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          {/* Photo Section */}
          <div className="text-center mb-4">
            {card.photo ? (
              <div className="px-4">
                <div 
                  className="relative overflow-hidden rounded-2xl border-4 border-white shadow-md" 
                  style={{ 
                    height: '180px',
                    backgroundImage: `url(${card.photo})`,
                    backgroundSize: card.imagePosition 
                      ? `${100 * card.imagePosition.scale}%`
                      : '100%',
                    backgroundPosition: card.imagePosition
                      ? `${50 + (card.imagePosition.x / 3.6)}% ${50 + (card.imagePosition.y / 3.6)}%`
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
          <h3 className="text-2xl font-black text-center text-foreground mb-4">
            {card.name}
          </h3>

          {/* Attributes */}
          <div className="space-y-2 text-sm">
            {card.relationship && card.relationship.trim() && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Relationship:</span>
                <span className="text-foreground capitalize font-medium">{card.relationship}</span>
              </div>
            )}
            
            {card.dateOfBirth && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Birthday:</span>
                <span className="text-foreground font-medium">
                  {new Date(card.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {card.favoriteColor && card.favoriteColor.trim() && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Favorite Color:</span>
                <span className="text-foreground font-medium">{card.favoriteColor}</span>
              </div>
            )}
            
            {card.hobbies && card.hobbies.trim() && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Hobbies:</span>
                <span className="text-foreground text-right font-medium">{card.hobbies}</span>
              </div>
            )}
            
            {card.funFact && card.funFact.trim() && (
              <div className="mt-3 p-3 bg-art-yellow/20 rounded-2xl">
                <span className="font-bold text-muted-foreground block mb-1">Fun Fact:</span>
                <p className="text-foreground text-xs leading-relaxed font-medium">{card.funFact}</p>
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
