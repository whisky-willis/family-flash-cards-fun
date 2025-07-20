import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Image as ImageIcon, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CardForm } from "@/components/CardForm";
import { FlipCardPreview } from "@/components/FlipCardPreview";
import { CardPreview } from "@/components/CardPreview";
import { DeckDesigner } from "@/components/DeckDesigner";
import { CardImageGenerator, CardImageGeneratorRef } from "@/components/CardImageGenerator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { useSupabaseCardsStorage, FamilyCard } from "@/hooks/useSupabaseCardsStorage";

const CreateCards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    cards, 
    loading, 
    saving, 
    uploadImage, 
    saveCard, 
    updateCard, 
    deleteCard, 
    linkCardsToOrder,
    refreshCards,
    generateCardImages
  } = useSupabaseCardsStorage();
  
  const [currentCard, setCurrentCard] = useState<Partial<FamilyCard>>({});
  const [previewCard, setPreviewCard] = useState<Partial<FamilyCard>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Deck-level state
  const [recipientName, setRecipientName] = useState('');
  const [deckTheme, setDeckTheme] = useState<'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports' | undefined>();
  const [deckFont, setDeckFont] = useState<'bubblegum' | 'luckiest-guy' | 'fredoka-one' | undefined>();

  // Refs for CardImageGenerator components
  const imageGeneratorRefs = useRef<Map<string, CardImageGeneratorRef>>(new Map());

  const handlePreviewChange = useCallback((previewData: Partial<FamilyCard>) => {
    setPreviewCard(previewData);
  }, []);

  // Enhanced image generation function with better data access
  const generateImagesForCard = async (cardId: string, cardData?: FamilyCard) => {
    console.log('🎯 Starting image generation for card:', cardId);
    console.log('🎯 Deck settings:', { deckTheme, deckFont });
    console.log('🎯 Card data provided:', !!cardData);
    
    // Use provided card data or find in current state
    let card = cardData || cards.find(c => c.id === cardId);
    
    // If still no card data, try to fetch from database
    if (!card) {
      console.log('🎯 Card not found in state, will proceed without card data check');
      // We'll let the image generator handle the missing card case
    }
    
    if (!deckTheme || !deckFont) {
      console.log('❌ Cannot generate images: missing theme or font', { deckTheme, deckFont });
      toast({
        title: "Image Generation Skipped",
        description: "Please select both theme and font in the deck designer first.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🎯 Available refs:', Array.from(imageGeneratorRefs.current.keys()));
      
      // Wait for DOM to stabilize
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get the CardImageGenerator ref for this card
      const generatorRef = imageGeneratorRefs.current.get(cardId);
      if (!generatorRef) {
        console.error('❌ No image generator ref found for card:', cardId);
        // Retry once after a longer delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        const retryRef = imageGeneratorRefs.current.get(cardId);
        if (!retryRef) {
          console.error('❌ Still no ref after retry for card:', cardId);
          return;
        }
        console.log('✅ Found generator ref on retry');
      }

      const activeRef = generatorRef || imageGeneratorRefs.current.get(cardId);
      if (!activeRef) {
        console.error('❌ No active ref available for card:', cardId);
        return;
      }

      console.log('✅ Found generator ref, calling generateImages...');
      
      // Generate images using the ref
      const { frontImageUrl, backImageUrl } = await activeRef.generateImages();
      
      console.log('🎯 Image generation result:', { 
        frontImageUrl: !!frontImageUrl, 
        backImageUrl: !!backImageUrl,
        frontLength: frontImageUrl?.length,
        backLength: backImageUrl?.length 
      });
      
      if (frontImageUrl || backImageUrl) {
        console.log('✅ Images generated successfully, uploading to database...');
        const result = await generateCardImages(cardId, frontImageUrl || undefined, backImageUrl || undefined);
        
        if (result.success) {
          console.log('✅ Card images saved successfully for card:', cardId);
          toast({
            title: "Images Generated",
            description: "Card images have been generated and saved.",
          });
        } else {
          console.error('❌ Failed to save card images for card:', cardId);
        }
      } else {
        console.error('❌ Image generation failed - no images returned');
      }
    } catch (error) {
      console.error('❌ Error generating images for card:', cardId, error);
      toast({
        title: "Image Generation Error",
        description: "Failed to generate card images. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCard = async (card: Omit<FamilyCard, 'id'>) => {
    const cardId = await saveCard(card, async (newCardId) => {
      // Pass the card data directly to avoid race condition
      const cardWithId: FamilyCard = { ...card, id: newCardId };
      await generateImagesForCard(newCardId, cardWithId);
    });
    
    if (cardId) {
      setCurrentCard({});
      setPreviewCard({});
      
      toast({
        title: "Card Added!",
        description: `${card.name}'s card has been added to your collection.`,
      });
    }
  };

  const handleEditCard = (card: FamilyCard) => {
    setCurrentCard(card);
    setPreviewCard(card);
    setIsEditing(true);
  };

  const handleUpdateCard = async (updatedCard: Omit<FamilyCard, 'id'>) => {
    if (currentCard.id) {
      const success = await updateCard(currentCard.id, updatedCard, async (cardId) => {
        // Pass the updated card data directly
        const cardWithId: FamilyCard = { ...updatedCard, id: cardId };
        await generateImagesForCard(cardId, cardWithId);
      });
      
      if (success) {
        setCurrentCard({});
        setPreviewCard({});
        setIsEditing(false);
        
        toast({
          title: "Card Updated!",
          description: `${updatedCard.name}'s card has been updated.`,
        });
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const success = await deleteCard(cardId);
    if (success) {
      // Remove the ref when card is deleted
      imageGeneratorRefs.current.delete(cardId);
      
      toast({
        title: "Card Removed",
        description: "The card has been removed from your collection.",
      });
    }
  };

  // Enhanced function to set refs for CardImageGenerator components
  const setImageGeneratorRef = (cardId: string, ref: CardImageGeneratorRef | null) => {
    console.log('🎯 Setting ref for card:', cardId, '- ref exists:', !!ref);
    if (ref) {
      imageGeneratorRefs.current.set(cardId, ref);
      console.log('✅ Ref stored for card:', cardId);
    } else {
      imageGeneratorRefs.current.delete(cardId);
      console.log('🗑️ Ref removed for card:', cardId);
    }
  };

  const handleProceedToOrder = async () => {
    if (cards.length === 0) {
      toast({
        title: "No Cards Created",
        description: "Please create at least one card before proceeding to order.",
        variant: "destructive",
      });
      return;
    }
    
    if (!recipientName || !deckTheme || !deckFont) {
      toast({
        title: "Deck Design Incomplete",
        description: "Please complete the deck design section (recipient name, theme, and font) before proceeding to order.",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would create an order and link the cards to it
    // For now, just navigate to the order page
    navigate('/order', { 
      state: { 
        cards,
        deckDesign: {
          recipientName,
          theme: deckTheme,
          font: deckFont
        }
      } 
    });
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
    
    toast({
      title: "Collection Saved!",
      description: "Your cards are automatically saved and will persist across sessions.",
    });
  };

  const handleUploadImage = async (file: File): Promise<string | null> => {
    return await uploadImage(file);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Organic background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-art-pink rounded-full filter blur-xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-art-yellow filter blur-xl opacity-40 translate-x-1/3" style={{
          clipPath: 'polygon(30% 0%, 70% 20%, 100% 60%, 80% 100%, 20% 100%, 0% 60%)'
        }}></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-art-green rounded-full filter blur-xl opacity-35 translate-y-1/3"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-art-blue rounded-full filter blur-xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-art-orange rounded-full filter blur-xl opacity-35 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Navigation - Art Center style */}
      <nav className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                {/* Back arrow on mobile, logo on desktop */}
                <div className="sm:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/')}
                    className="p-2"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </div>
                <img 
                  src="/lovable-uploads/5128289b-d7c7-4d2c-9975-2651dcb38ae0.png" 
                  alt="Kindred Cards" 
                  className="hidden sm:block h-12 w-32 object-cover object-center cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => navigate('/')}
                />
              </div>
              <div className="hidden lg:flex space-x-6 text-sm font-medium uppercase tracking-wide">
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">About</span>
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">Examples</span>
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">Pricing</span>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-center md:justify-end sm:space-x-3 md:space-x-4 gap-2 sm:gap-0 md:gap-3">
                <Button
                  onClick={handleSaveCollection}
                  variant="outline"
                  className="px-3 py-1 sm:px-4 md:px-4 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-sm font-medium uppercase tracking-wide flex-1 sm:flex-none md:flex-none"
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
              <div className="hidden sm:flex w-8 h-8 bg-primary rounded-full items-center justify-center text-primary-foreground text-sm font-bold">
                {cards.length}
              </div>
              {saving && (
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
            Create Your Kindred Cards
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Design your deck style, then add photos and details for each family member or friend
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Deck Designer and Card Form */}
          <div className="space-y-8">
            {/* Deck Designer */}
            <DeckDesigner
              recipientName={recipientName}
              selectedTheme={deckTheme}
              selectedFont={deckFont}
              onRecipientNameChange={setRecipientName}
              onThemeChange={setDeckTheme}
              onFontChange={setDeckFont}
              onPreviewChange={(theme, font) => {
                // No need to update preview card theme/font since we use deck-level settings
              }}
            />

            {/* Card Form */}
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
                    setPreviewCard({});
                    setIsEditing(false);
                  }}
                  onPreviewChange={handlePreviewChange}
                  isEditing={isEditing}
                  deckTheme={deckTheme}
                  deckFont={deckFont}
                  onUploadImage={handleUploadImage}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Card Preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-blue/20 rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl font-black">
                  <ImageIcon className="h-6 w-6 text-art-blue" />
                  <span>Card Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FlipCardPreview 
                  card={previewCard} 
                  deckTheme={deckTheme}
                  deckFont={deckFont}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cards Collection */}
        {cards.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-8 text-center">
              {recipientName ? `${recipientName}'s Collection` : 'Your Collection'} ({cards.length} cards)
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cards.map((card) => (
                <div key={card.id} className="relative hover:scale-105 transition-transform duration-300">
                  <CardPreview 
                    card={card} 
                    onEdit={() => handleEditCard(card)}
                    onDelete={() => handleDeleteCard(card.id)}
                    showActions={true}
                    deckTheme={deckTheme}
                    deckFont={deckFont}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">Loading your cards...</p>
          </div>
        )}
      </div>

      {/* Image generators positioned off-screen but visible for html2canvas */}
      <div style={{
        position: 'fixed',
        left: '-2000px',
        top: '0',
        width: '400px',
        height: 'auto',
        pointerEvents: 'none',
        zIndex: -1000,
        visibility: 'hidden' // Hide from users but keep for html2canvas
      }}>
        {cards.map((card) => (
          <div key={`generator-${card.id}`} style={{ marginBottom: '20px' }}>
            <CardImageGenerator
              ref={(ref) => setImageGeneratorRef(card.id, ref)}
              card={card}
              isFlipCard={true}
              deckTheme={deckTheme}
              deckFont={deckFont}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateCards;
