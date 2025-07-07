import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Users, Image as ImageIcon, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CardForm } from "@/components/CardForm";
import { CardPreview } from "@/components/CardPreview";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { useSupabaseCards } from "@/hooks/useSupabaseCards";
import { useDraft } from "@/hooks/useDraft";
import { supabase } from "@/integrations/supabase/client";
const kindredLogo = "/lovable-uploads/b059ee5b-3853-4004-9b40-6da60dbfe02f.png";

export interface FamilyCard {
  id: string;
  name: string;
  photo: string;
  dateOfBirth: string;
  favoriteColor: string;
  hobbies: string;
  funFact: string;
  whereTheyLive: string;
  theme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  font?: 'fredoka' | 'comic-neue' | 'bubblegum' | 'kalam' | 'pangolin' | 'boogaloo' | 'luckiest-guy';
  imagePosition?: { x: number; y: number; scale: number };
}

const CreateCards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAnonymous } = useAuth();
  const { cards, addCard, updateCard, removeCard, isLoaded, isSaving } = useSupabaseCards();
  const { saveDraftToLocal, clearDraft } = useDraft();
  const [currentCard, setCurrentCard] = useState<Partial<FamilyCard>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleFormChange = useCallback((updatedCard: Partial<FamilyCard>) => {
    setCurrentCard(updatedCard);
  }, []);

  const handleAddCard = async (card: Omit<FamilyCard, 'id'>) => {
    const newCard = await addCard(card);
    const updatedCards = [...cards, newCard];
    
    // Save to draft for persistence
    saveDraftToLocal(updatedCards);
    
    setCurrentCard({});
    
    toast({
      title: "Card Added!",
      description: `${card.name}'s card has been ${isAnonymous ? 'saved to your draft' : 'added to your collection'}.`,
    });
  };

  const handleEditCard = (card: FamilyCard) => {
    setCurrentCard(card);
    setIsEditing(true);
  };

  const handleUpdateCard = async (updatedCard: Omit<FamilyCard, 'id'>) => {
    if (currentCard.id) {
      await updateCard(currentCard.id, updatedCard);
      
      // Update draft with modified cards
      const updatedCards = cards.map(card => 
        card.id === currentCard.id 
          ? { ...updatedCard, id: currentCard.id }
          : card
      );
      saveDraftToLocal(updatedCards);
      
      setCurrentCard({});
      setIsEditing(false);
      
      toast({
        title: "Card Updated!",
        description: `${updatedCard.name}'s card has been updated.`,
      });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    await removeCard(cardId);
    
    // Update draft after deletion
    const updatedCards = cards.filter(card => card.id !== cardId);
    saveDraftToLocal(updatedCards);
    
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
    navigate('/order', { state: { cards } });
  };

  const handleSaveCollection = () => {
    if (cards.length === 0) {
      toast({
        title: "No Cards to Save",
        description: "Please create at least one card before saving a collection.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user || isAnonymous) {
      setShowAuthModal(true);
    } else {
      // User is already authenticated, save directly
      saveAuthentatedCollection();
    }
  };

  const saveAuthentatedCollection = async () => {
    try {
      const { error } = await supabase.auth.getUser();
      if (error) throw error;

      toast({
        title: "Collection Saved!",
        description: "Your cards have been saved to your profile.",
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleAuthSuccess = () => {
    clearDraft();
    toast({
      title: "Success!",
      description: "Your account has been created and cards saved!",
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Organic background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-art-pink rounded-full mix-blend-multiply filter blur-xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-art-yellow rounded-full mix-blend-multiply filter blur-xl opacity-70 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-art-green rounded-full mix-blend-multiply filter blur-xl opacity-70 translate-y-1/3"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-art-blue rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-art-orange rounded-full mix-blend-multiply filter blur-xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Navigation - Art Center style */}
      <nav className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <img 
                  src={kindredLogo} 
                  alt="Kindred Cards" 
                  className="h-12 w-32 object-cover object-center cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => navigate('/')}
                />
              </div>
              <div className="hidden md:flex space-x-6 text-sm font-medium uppercase tracking-wide">
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">About</span>
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">Examples</span>
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">Pricing</span>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-start sm:space-x-4 w-full gap-2 sm:gap-0">
                <Button
                  onClick={handleSaveCollection}
                  variant="outline"
                  className="px-3 py-1 sm:px-5 sm:py-1.5 text-xs sm:text-sm font-medium uppercase tracking-wide flex-1 sm:flex-none"
                  disabled={cards.length === 0}
                >
                  <Save className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
                  Save for Later
                </Button>
                <Button 
                  onClick={handleProceedToOrder}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 sm:px-5 sm:py-1.5 text-xs sm:text-sm font-medium uppercase tracking-wide flex-1 sm:flex-none"
                  disabled={cards.length === 0}
                >
                  Order Cards
                </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                {cards.length}
              </div>
              {isSaving && (
                <div className="text-sm text-muted-foreground">
                  Saving...
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-6">
            Create Your Family Cards
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Add photos and details for each family member or friend
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card Form */}
          <div className="min-h-screen">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-pink/20 rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl font-black">
                  <Users className="h-6 w-6 text-art-pink" />
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
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-blue/20 rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl font-black">
                  <ImageIcon className="h-6 w-6 text-art-blue" />
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
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-8 text-center">
              Your Card Collection ({cards.length} cards)
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cards.map((card) => (
                <div key={card.id} className="relative hover:scale-105 transition-transform duration-300">
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

        {/* Auth Modal */}
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          cards={cards}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};

export default CreateCards;
