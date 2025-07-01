import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CardForm } from "@/components/CardForm";
import { CardPreview } from "@/components/CardPreview";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";

export interface FamilyCard {
  id: string;
  name: string;
  photo: string;
  dateOfBirth: string;
  favoriteColor: string;
  hobbies: string;
  funFact: string;
  relationship: string;
}

const CreateCards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cards, addCard, updateCard, deleteCard } = useCart();
  const [currentCard, setCurrentCard] = useState<Partial<FamilyCard>>({});
  const [isEditing, setIsEditing] = useState(false);

  const handleFormChange = useCallback((updatedCard: Partial<FamilyCard>) => {
    setCurrentCard(updatedCard);
  }, []);

  const handleAddCard = (card: Omit<FamilyCard, 'id'>) => {
    const newCard = {
      ...card,
      id: Date.now().toString(),
    };
    addCard(newCard);
    setCurrentCard({});
    toast({
      title: "Card Added!",
      description: `${card.name}'s card has been added to your collection.`,
    });
  };

  const handleEditCard = (card: FamilyCard) => {
    setCurrentCard(card);
    setIsEditing(true);
  };

  const handleUpdateCard = (updatedCard: Omit<FamilyCard, 'id'>) => {
    const fullUpdatedCard = { ...updatedCard, id: currentCard.id as string };
    updateCard(fullUpdatedCard);
    setCurrentCard({});
    setIsEditing(false);
    toast({
      title: "Card Updated!",
      description: `${updatedCard.name}'s card has been updated.`,
    });
  };

  const handleDeleteCard = (cardId: string) => {
    deleteCard(cardId);
    toast({
      title: "Card Removed",
      description: "The card has been removed from your collection.",
    });
  };

  const handleProceedToOrder = () => {
    if (cards.length === 0) {
      toast({
        title: "No Cards Created",
        description: "Please create at least one card before proceeding to order.",
        variant: "destructive",
      });
      return;
    }
    navigate('/order');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="text-2xl font-bold text-gray-800">FamilyCards</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Home
              </Button>
              <Button 
                onClick={handleProceedToOrder}
                className="bg-pink-500 hover:bg-pink-600"
                disabled={cards.length === 0}
              >
                Order Cards ({cards.length})
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Family Cards
          </h1>
          <p className="text-xl text-gray-600">
            Add photos and details for each family member or friend
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card Form */}
          <div>
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-pink-500" />
                  <span>{isEditing ? 'Edit Card' : 'Add New Card'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardForm
                  initialData={currentCard}
                  onSubmit={isEditing ? handleUpdateCard : handleAddCard}
                  onCancel={() => {
                    setCurrentCard({});
                    setIsEditing(false);
                  }}
                  onChange={handleFormChange}
                  isEditing={isEditing}
                />
              </CardContent>
            </Card>
          </div>

          {/* Card Preview */}
          <div>
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-6 w-6 text-blue-500" />
                  <span>Card Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardPreview card={currentCard} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cards Collection */}
        {cards.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Card Collection ({cards.length} cards)
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cards.map((card) => (
                <div key={card.id} className="relative">
                  <CardPreview 
                    card={card} 
                    onEdit={() => handleEditCard(card)}
                    onDelete={() => handleDeleteCard(card.id)}
                    showActions={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCards;
