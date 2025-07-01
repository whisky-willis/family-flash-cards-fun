import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FamilyCard } from '@/pages/CreateCards';

interface CartContextType {
  cards: FamilyCard[];
  addCard: (card: FamilyCard) => void;
  updateCard: (card: FamilyCard) => void;
  deleteCard: (cardId: string) => void;
  clearCart: () => void;
  setCards: (cards: FamilyCard[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cards, setCardsState] = useState<FamilyCard[]>([]);

  // Load cards from localStorage on mount
  useEffect(() => {
    const savedCards = localStorage.getItem('familyCards');
    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards);
        setCardsState(parsedCards);
      } catch (error) {
        console.warn('Failed to parse saved cards from localStorage:', error);
        localStorage.removeItem('familyCards');
      }
    }
  }, []);

  // Save cards to localStorage whenever cards change
  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem('familyCards', JSON.stringify(cards));
    } else {
      localStorage.removeItem('familyCards');
    }
  }, [cards]);

  const addCard = (card: FamilyCard) => {
    setCardsState(prev => [...prev, card]);
  };

  const updateCard = (updatedCard: FamilyCard) => {
    setCardsState(prev => 
      prev.map(card => card.id === updatedCard.id ? updatedCard : card)
    );
  };

  const deleteCard = (cardId: string) => {
    setCardsState(prev => prev.filter(card => card.id !== cardId));
  };

  const clearCart = () => {
    setCardsState([]);
    localStorage.removeItem('familyCards');
  };

  const setCards = (newCards: FamilyCard[]) => {
    setCardsState(newCards);
  };

  const value: CartContextType = {
    cards,
    addCard,
    updateCard,
    deleteCard,
    clearCart,
    setCards,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};