import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Image as ImageIcon, Save, ArrowLeft, Loader2 } from "lucide-react";
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
import { ImageGenerationProgressModal } from "@/components/ImageGenerationProgressModal";
import { useDraft } from "@/hooks/useDraft";
import { supabase } from "@/integrations/supabase/client";

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
    generateCardImages,
    setInitialCards
  } = useSupabaseCardsStorage();

  // Draft management
  const { getDraft, clearDraft } = useDraft();
  
  const [currentCard, setCurrentCard] = useState<Partial<FamilyCard>>({});
  const [previewCard, setPreviewCard] = useState<Partial<FamilyCard>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageGenerationProgress, setImageGenerationProgress] = useState({ current: 0, total: 0 });
  const [currentCardBeingGenerated, setCurrentCardBeingGenerated] = useState<FamilyCard | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deck-level state
  const [recipientName, setRecipientName] = useState('');
  const [deckTheme, setDeckTheme] = useState<'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports' | undefined>();
  const [deckFont, setDeckFont] = useState<'bubblegum' | 'luckiest-guy' | 'fredoka-one' | undefined>();

  // Use ref to track if draft has been loaded to prevent multiple loads
  const draftLoadedRef = useRef(false);

  // Load draft data on component mount - only run once
  useEffect(() => {
    if (draftLoadedRef.current) {
      return; // Draft already loaded, skip
    }

    const draftData = getDraft();
    console.log('🎯 CreateCards: Loading draft data:', draftData);
    
    // Load deck design settings
    if (draftData.deckDesign) {
      const { recipientName: draftRecipientName, theme, font } = draftData.deckDesign;
      
      if (draftRecipientName) {
        console.log('🎯 CreateCards: Setting recipientName from draft:', draftRecipientName);
        setRecipientName(draftRecipientName);
      }
      
      if (theme) {
        console.log('🎯 CreateCards: Setting deckTheme from draft:', theme);
        setDeckTheme(theme);
      }
      
      if (font) {
        console.log('🎯 CreateCards: Setting deckFont from draft:', font);
        setDeckFont(font);
      }
    }

    // Load draft cards
    if (draftData.cards && draftData.cards.length > 0) {
      console.log('🎯 CreateCards: Loading draft cards:', draftData.cards.length);
      setInitialCards(draftData.cards);
    }

    // Mark draft as loaded
    draftLoadedRef.current = true;
  }, []); // Empty dependency array - only run once on mount

  // Refs for CardImageGenerator components
  const imageGeneratorRefs = useRef<Map<string, CardImageGeneratorRef>>(new Map());

  const handlePreviewChange = useCallback((previewData: Partial<FamilyCard>) => {
    setPreviewCard(previewData);
  }, []);

  // Bulk image generation function for all cards
  const regenerateAllCardImages = async () => {
    if (!deckTheme || !deckFont) {
      toast({
        title: "Missing Deck Design",
        description: "Please select both theme and font before generating images.",
        variant: "destructive",
      });
      return false;
    }

    if (cards.length === 0) {
      return true; // No cards to generate
    }

    setIsGeneratingImages(true);
    setImageGenerationProgress({ current: 0, total: cards.length });
    setCurrentCardBeingGenerated(null);

    try {
      console.log('🎯 Starting bulk image generation for', cards.length, 'cards');
      
      // Wait for DOM to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      let successCount = 0;
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        setImageGenerationProgress({ current: i + 1, total: cards.length });
        setCurrentCardBeingGenerated(card);
        
        console.log(`🎯 Generating images for card ${i + 1}/${cards.length}: ${card.name}`);
        
        try {
          // Get the CardImageGenerator ref for this card
          const generatorRef = imageGeneratorRefs.current.get(card.id);
          if (!generatorRef) {
            console.warn(`❌ No generator ref found for card: ${card.id}`);
            continue;
          }

          console.log(`✅ Found generator ref for card: ${card.name}`);
          
          // Generate images using the ref
          const { frontImageUrl, backImageUrl } = await generatorRef.generateImages();
          
          console.log(`🎯 Generated images for ${card.name}:`, { 
            frontImageUrl: !!frontImageUrl, 
            backImageUrl: !!backImageUrl 
          });
          
          if (frontImageUrl || backImageUrl) {
            // Get user ID for filename
            const userId = user?.id;
            const cardName = card.name;
            
            console.log(`🎯 Saving images for ${card.name} with userId:`, userId);
            
            const result = await generateCardImages(
              card.id, 
              frontImageUrl || undefined, 
              backImageUrl || undefined,
              cardName,
              userId
            );
            
            if (result.success) {
              successCount++;
              console.log(`✅ Successfully saved images for card: ${card.name}`);
            } else {
              console.error(`❌ Failed to save images for card: ${card.name}`);
            }
          } else {
            console.error(`❌ No images generated for card: ${card.name}`);
          }
        } catch (error) {
          console.error(`❌ Error generating images for card ${card.name}:`, error);
        }
        
        // Small delay between cards to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`🎯 Bulk generation complete. Success: ${successCount}/${cards.length}`);
      
      if (successCount === cards.length) {
        toast({
          title: "Images Generated!",
          description: `Successfully generated images for all ${cards.length} cards.`,
        });
        return true;
      } else if (successCount > 0) {
        toast({
          title: "Partial Success",
          description: `Generated images for ${successCount} of ${cards.length} cards. You can still proceed with your order.`,
        });
        return true;
      } else {
        toast({
          title: "Image Generation Failed",
          description: "Failed to generate images for your cards. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Error in bulk image generation:', error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating images. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGeneratingImages(false);
      setImageGenerationProgress({ current: 0, total: 0 });
      setCurrentCardBeingGenerated(null);
    }
  };

  const handleAddCard = async (card: Omit<FamilyCard, 'id'>) => {
    // Save card without image generation
    const cardId = await saveCard(card);
    
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
      // Update card without image generation
      const success = await updateCard(currentCard.id, updatedCard);
      
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

    // Generate all card images with current deck design before proceeding
    const imagesGenerated = await regenerateAllCardImages();
    
    if (!imagesGenerated) {
      return; // Don't proceed if image generation failed
    }

    // Wait for cards to be refreshed with new image URLs from the database
    await refreshCards(true);
    
    // Navigate to order page
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

  const handleSaveCollection = async () => {
    if (cards.length === 0) {
      toast({
        title: "No Cards to Save",
        description: "Please create at least one card before saving a collection.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      // Show auth modal for unauthenticated users
      setShowAuthModal(true);
      return;
    }
    
    // User is authenticated - save collection to database
    setIsSaving(true);
    
    try {
      // Generate collection name
      const collectionName = recipientName ? `${recipientName}'s Cards` : 'My Card Collection';
      
      // Prepare deck design data
      const deckDesign = {
        recipientName,
        theme: deckTheme,
        font: deckFont
      };
      
      // Save to card_collections table
      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          name: collectionName,
          description: `Collection created with ${cards.length} cards`,
          cards: cards as any,
          deck_design: deckDesign as any
        });
      
      if (error) {
        console.error('Error saving collection:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save your collection. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Clear draft after successful save
      clearDraft();
      
      toast({
        title: "Collection Saved!",
        description: `"${collectionName}" has been saved to your account.`,
      });
      
    } catch (error) {
      console.error('Error saving collection:', error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadImage = async (file: File): Promise<string | null> => {
    // Redundant validation happens in the hook as well
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
                  disabled={cards.length === 0 || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
                      Save for Later
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleProceedToOrder}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 sm:px-5 sm:py-1.5 text-xs sm:text-sm font-medium uppercase tracking-wide flex-1 sm:flex-none"
                  disabled={cards.length === 0 || isGeneratingImages}
                >
                  {isGeneratingImages ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Order Cards"
                  )}
                </Button>
              <div className="hidden sm:flex w-8 h-8 bg-primary rounded-full items-center justify-center text-primary-foreground text-sm font-bold">
                {cards.length}
              </div>
              {(saving || isGeneratingImages || isSaving) && (
                <div className="text-sm text-muted-foreground">
                  {isGeneratingImages ? `Generating ${imageGenerationProgress.current}/${imageGenerationProgress.total}` : 
                   isSaving ? 'Saving collection...' : 'Saving...'}
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

        {/* Image Generation Progress */}
        {isGeneratingImages && (
          <div className="mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-blue/20 rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Loader2 className="h-6 w-6 animate-spin text-art-blue mr-2" />
                    <span className="text-lg font-medium">Generating Card Images...</span>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Creating images for card {imageGenerationProgress.current} of {imageGenerationProgress.total}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-art-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(imageGenerationProgress.current / imageGenerationProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                  showActions={true}
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

      {/* Image Generation Progress Modal */}
      <ImageGenerationProgressModal
        isOpen={isGeneratingImages}
        currentCard={currentCardBeingGenerated}
        progress={imageGenerationProgress}
        deckTheme={deckTheme}
        deckFont={deckFont}
      />

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

      {/* Auth Modal for Save Collection */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        cards={cards}
        deckDesign={{
          recipientName,
          theme: deckTheme,
          font: deckFont
        }}
        onSuccess={() => {
          setShowAuthModal(false);
          clearDraft();
          toast({
            title: "Account Created!",
            description: "Your cards have been saved to your new account.",
          });
        }}
      />
    </div>
  );
};

export default CreateCards;
