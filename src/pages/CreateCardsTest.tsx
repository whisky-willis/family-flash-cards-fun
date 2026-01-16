import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Users, Image as ImageIcon, Save, ArrowLeft, Loader2, User, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CardForm } from "@/components/CardForm";
import { FlipCardPreview } from "@/components/FlipCardPreview";
import { CardPreview } from "@/components/CardPreview";
import { SimpleBackgroundSelector } from "@/components/SimpleBackgroundSelector";
import { CardImageGenerator, CardImageGeneratorRef } from "@/components/CardImageGenerator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { useSupabaseCardsStorage, FamilyCard } from "@/hooks/useSupabaseCardsStorage";
import { ImageGenerationProgressModal } from "@/components/ImageGenerationProgressModal";
import { useDraft } from "@/hooks/useDraft";
import { supabase } from "@/integrations/supabase/client";

// Fixed font for test version
const FIXED_FONT = 'bubblegum' as const;

const CreateCardsTest = () => {
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

  const { getDraft, clearDraft } = useDraft();

  const [currentCard, setCurrentCard] = useState<Partial<FamilyCard>>({});
  const [previewCard, setPreviewCard] = useState<Partial<FamilyCard>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageGenerationProgress, setImageGenerationProgress] = useState({ current: 0, total: 0 });
  const [currentCardBeingGenerated, setCurrentCardBeingGenerated] = useState<FamilyCard | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deck-level state - font is fixed
  const [recipientName, setRecipientName] = useState('');
  const [deckTheme, setDeckTheme] = useState<'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports' | undefined>();
  const deckFont = FIXED_FONT; // Fixed font

  const draftLoadedRef = useRef(false);

  // Load draft data on component mount
  useEffect(() => {
    if (draftLoadedRef.current) {
      return;
    }

    const draftData = getDraft();
    console.log('🎯 CreateCardsTest: Loading draft data:', draftData);

    if (draftData.deckDesign) {
      const { recipientName: draftRecipientName, theme } = draftData.deckDesign;

      if (draftRecipientName) {
        setRecipientName(draftRecipientName);
      }

      if (theme) {
        setDeckTheme(theme);
      }
    }

    if (draftData.cards && draftData.cards.length > 0) {
      setInitialCards(draftData.cards);
    }

    draftLoadedRef.current = true;
  }, []);

  const imageGeneratorRefs = useRef<Map<string, CardImageGeneratorRef>>(new Map());

  const handlePreviewChange = useCallback((previewData: Partial<FamilyCard>) => {
    setPreviewCard(previewData);
  }, []);

  const regenerateAllCardImages = async () => {
    if (!deckTheme) {
      toast({
        title: "Missing Background",
        description: "Please select a background theme before generating images.",
        variant: "destructive",
      });
      return false;
    }

    if (cards.length === 0) {
      return true;
    }

    setIsGeneratingImages(true);
    setImageGenerationProgress({ current: 0, total: cards.length });
    setCurrentCardBeingGenerated(null);

    try {
      console.log('🎯 Starting bulk image generation for', cards.length, 'cards');

      await new Promise(resolve => setTimeout(resolve, 1000));

      let successCount = 0;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        setImageGenerationProgress({ current: i + 1, total: cards.length });
        setCurrentCardBeingGenerated(card);

        console.log(`🎯 Generating images for card ${i + 1}/${cards.length}: ${card.name}`);

        try {
          const generatorRef = imageGeneratorRefs.current.get(card.id);
          if (!generatorRef) {
            console.warn(`❌ No generator ref found for card: ${card.id}`);
            continue;
          }

          const { frontImageUrl, backImageUrl } = await generatorRef.generateImages();

          if (frontImageUrl || backImageUrl) {
            const userId = user?.id;
            const cardName = card.name;

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
            }
          }
        } catch (error) {
          console.error(`❌ Error generating images for card ${card.name}:`, error);
        }

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
          description: `Generated images for ${successCount} of ${cards.length} cards.`,
        });
        return true;
      } else {
        toast({
          title: "Image Generation Failed",
          description: "Failed to generate images. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Error in bulk image generation:', error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating images.",
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
    const cardId = await saveCard(card);

    if (cardId) {
      setCurrentCard({});
      setPreviewCard({});

      toast({
        title: "Card Added!",
        description: `${card.name}'s card has been added.`,
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
      imageGeneratorRefs.current.delete(cardId);
      toast({
        title: "Card Removed",
        description: "The card has been removed.",
      });
    }
  };

  const setImageGeneratorRef = (cardId: string, ref: CardImageGeneratorRef | null) => {
    if (ref) {
      imageGeneratorRefs.current.set(cardId, ref);
    } else {
      imageGeneratorRefs.current.delete(cardId);
    }
  };

  const handleProceedToOrder = async () => {
    if (cards.length === 0) {
      toast({
        title: "No Cards Created",
        description: "Please create at least one card before ordering.",
        variant: "destructive",
      });
      return;
    }

    if (!recipientName || !deckTheme) {
      toast({
        title: "Design Incomplete",
        description: "Please enter recipient name and select a background.",
        variant: "destructive",
      });
      return;
    }

    const imagesGenerated = await regenerateAllCardImages();

    if (!imagesGenerated) {
      return;
    }

    await refreshCards(true);

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
        description: "Please create at least one card.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);

    try {
      const collectionName = recipientName ? `${recipientName}'s Cards` : 'My Card Collection';

      const deckDesign = {
        recipientName,
        theme: deckTheme,
        font: deckFont
      };

      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          name: collectionName,
          description: `Collection with ${cards.length} cards`,
          cards: cards as any,
          deck_design: deckDesign as any
        });

      if (error) {
        console.error('Error saving collection:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save your collection.",
          variant: "destructive",
        });
        return;
      }

      clearDraft();

      toast({
        title: "Collection Saved!",
        description: `"${collectionName}" has been saved.`,
      });

    } catch (error) {
      console.error('Error saving collection:', error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadImage = async (file: File): Promise<string | null> => {
    return await uploadImage(file);
  };

  const isDesignComplete = recipientName && deckTheme;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-art-pink rounded-full filter blur-xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-art-yellow filter blur-xl opacity-40 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-art-green rounded-full filter blur-xl opacity-35 translate-y-1/3"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
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
                <span className="hidden lg:inline-block text-xs bg-art-blue/20 text-art-blue px-2 py-1 rounded-full font-medium">
                  TEST MODE
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={handleSaveCollection}
                variant="outline"
                className="px-3 py-1 sm:px-4 text-xs sm:text-sm font-medium"
                disabled={cards.length === 0 || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={handleProceedToOrder}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 sm:px-5 text-xs sm:text-sm font-medium"
                disabled={cards.length === 0 || isGeneratingImages}
              >
                {isGeneratingImages ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Order Cards"
                )}
              </Button>
              <div className="hidden sm:flex w-8 h-8 bg-primary rounded-full items-center justify-center text-primary-foreground text-sm font-bold">
                {cards.length}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-4">
            Create Your Cards
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Simple mode: Choose a background, add your family members
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
                    Card {imageGenerationProgress.current} of {imageGenerationProgress.total}
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
          {/* Left Column - Design and Form */}
          <div className="space-y-8">
            {/* Simplified Deck Designer */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-purple/20 rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl font-black">
                  <Heart className="h-6 w-6 text-art-purple" />
                  <span>Design Your Deck</span>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Choose a background for all your cards
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipient Name */}
                <div>
                  <Label htmlFor="recipientName" className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-art-pink" />
                    Who is this deck for?
                  </Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g., Grandma Sarah, The Johnson Family"
                    className="h-12 text-base"
                    autoComplete="off"
                  />
                </div>

                {/* Background Selection Only */}
                <div>
                  <Label className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Palette className="h-5 w-5 text-art-blue" />
                    Choose Your Background
                  </Label>
                  <SimpleBackgroundSelector
                    selectedTheme={deckTheme}
                    onThemeChange={setDeckTheme}
                  />
                </div>
              </CardContent>
            </Card>

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

          {/* Right Column - Preview */}
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

      {/* Hidden image generators */}
      <div style={{
        position: 'fixed',
        left: '-2000px',
        top: '0',
        width: '400px',
        height: 'auto',
        pointerEvents: 'none',
        zIndex: -1000,
        visibility: 'hidden'
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

      {/* Auth Modal */}
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
            description: "Your cards have been saved.",
          });
        }}
      />
    </div>
  );
};

export default CreateCardsTest;
