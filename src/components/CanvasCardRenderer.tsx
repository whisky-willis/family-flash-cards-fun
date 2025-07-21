
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";

interface CanvasCardRendererProps {
  card: FamilyCard;
  deckTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  deckFont?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
}

export interface CanvasCardRendererRef {
  generateFrontImage: () => Promise<string | null>;
  generateBackImage: () => Promise<string | null>;
}

// Font mapping for canvas rendering
const getFontFamily = (font?: string) => {
  switch (font) {
    case 'bubblegum': return 'Bubblegum Sans';
    case 'luckiest-guy': return 'Luckiest Guy';
    case 'fredoka-one': return 'Fredoka One';
    default: return 'Fredoka One';
  }
};

// Background image mapping
const getBackgroundImage = (theme?: string) => {
  switch (theme) {
    case 'geometric': return '/lovable-uploads/b6d6bac9-cbe0-403c-92d3-d931bef709be.png';
    case 'organic': return '/lovable-uploads/92562094-6386-421f-8a6e-8066dee1d8b9.png';
    case 'rainbow': return '/lovable-uploads/218e023d-f5aa-4d6b-ad30-fe4544c295d4.png';
    case 'mosaic': return '/lovable-uploads/473f2252-c157-4af5-8dce-4d10b6e0191a.png';
    case 'space': return '/lovable-uploads/a5f11a82-3c49-41b7-a0fc-7c2d29fdcda9.png';
    case 'sports': return '/lovable-uploads/73e0e4f2-881f-4259-82b5-0cc0a112eae5.png';
    default: return null;
  }
};

// Load image helper
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Wait for fonts to load
const waitForFonts = async () => {
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 100));
};

export const CanvasCardRenderer = forwardRef<CanvasCardRendererRef, CanvasCardRendererProps>(({
  card,
  deckTheme,
  deckFont
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render front side of card
  const renderFrontCard = async (): Promise<string | null> => {
    try {
      console.log('🎯 Starting front card render with Canvas API...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Set canvas size to match preview exactly (384x384px)
      const size = 384;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);

      // Wait for fonts to be ready
      await waitForFonts();

      // Card styling constants to match FlippableCardPreview
      const cardPadding = 16; // p-4 in preview
      const cardRadius = 24; // rounded-3xl
      const borderWidth = 2; // border-2
      
      // Calculate layout dimensions to match preview's flex layout
      // In preview: name area is fixed at bottom, photo area takes flex-1
      const nameAreaHeight = 64; // h-16 for name area in preview
      const photoAreaHeight = size - (cardPadding * 2) - nameAreaHeight;
      
      // Draw theme background first (full card)
      const backgroundSrc = getBackgroundImage(deckTheme);
      if (backgroundSrc) {
        try {
          const backgroundImg = await loadImage(backgroundSrc);
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, cardRadius);
          ctx.clip();
          ctx.drawImage(backgroundImg, 0, 0, size, size);
          ctx.restore();
        } catch (error) {
          console.warn('Could not load background image:', error);
          // Fallback to white background
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, cardRadius);
          ctx.fill();
        }
      } else {
        // Draw white background if no theme
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, cardRadius);
        ctx.fill();
      }

      // Draw card border (matching preview border styling)
      if (deckTheme !== 'rainbow') {
        // For non-rainbow themes, draw a subtle border
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)'; // art-pink/30
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        ctx.roundRect(borderWidth/2, borderWidth/2, size - borderWidth, size - borderWidth, cardRadius);
        ctx.stroke();
      }

      // Calculate photo area dimensions and position
      const photoArea = {
        x: cardPadding,
        y: cardPadding,
        width: size - (cardPadding * 2),
        height: photoAreaHeight
      };

      // Draw photo with exact styling from preview
      if (card.photo_url) {
        try {
          const photoImg = await loadImage(card.photo_url);
          
          ctx.save();
          
          // Create rounded photo area with white border (matching preview)
          const photoBorderWidth = 4; // border-4 in preview
          const photoRadius = 16; // rounded-2xl
          
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(
            photoArea.x - photoBorderWidth, 
            photoArea.y - photoBorderWidth, 
            photoArea.width + (photoBorderWidth * 2), 
            photoArea.height + (photoBorderWidth * 2), 
            photoRadius
          );
          ctx.fill();
          
          // Clip to photo area
          ctx.beginPath();
          ctx.roundRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height, photoRadius);
          ctx.clip();

          // Calculate photo positioning to match CSS background-image behavior exactly
          let sourceX = 0, sourceY = 0, sourceWidth = photoImg.width, sourceHeight = photoImg.height;
          
          if (card.imagePosition) {
            const scale = card.imagePosition.scale;
            const offsetX = card.imagePosition.x;
            const offsetY = card.imagePosition.y;
            
            // Match CSS background-size calculation exactly
            const scaledWidth = photoImg.width / scale;
            const scaledHeight = photoImg.height / scale;
            
            // Match CSS background-position calculation exactly
            const positionX = 50 + (offsetX / (3.6 * scale));
            const positionY = 50 + (offsetY / (3.6 * scale));
            
            // Calculate crop area
            sourceX = Math.max(0, (photoImg.width - scaledWidth) * (positionX / 100));
            sourceY = Math.max(0, (photoImg.height - scaledHeight) * (positionY / 100));
            sourceWidth = Math.min(scaledWidth, photoImg.width - sourceX);
            sourceHeight = Math.min(scaledHeight, photoImg.height - sourceY);
          }

          // Draw photo
          ctx.drawImage(
            photoImg,
            sourceX, sourceY, sourceWidth, sourceHeight,
            photoArea.x, photoArea.y, photoArea.width, photoArea.height
          );
          
          ctx.restore();
        } catch (error) {
          console.warn('Could not load photo:', error);
          // Draw placeholder matching preview
          const placeholderSize = 128; // w-32 h-32 in preview
          const placeholderX = (size - placeholderSize) / 2;
          const placeholderY = photoArea.y + (photoArea.height - placeholderSize) / 2;
          
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // art-yellow/20
          ctx.beginPath();
          ctx.arc(placeholderX + placeholderSize/2, placeholderY + placeholderSize/2, placeholderSize/2, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }

      // Draw name with exact text styling from preview
      if (card.name) {
        const fontFamily = getFontFamily(deckFont);
        // Match CSS text-3xl exactly (30px, not 32px)
        const fontSize = 30;
        
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Position text in name area at bottom
        const nameY = size - nameAreaHeight / 2;
        
        // Create multi-layer text shadow effect matching CSS
        // CSS: textShadow: '0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6)'
        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw multiple shadow layers for stronger effect
        for (let i = 0; i < 3; i++) {
          ctx.shadowBlur = 30 - (i * 10);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(card.name, size / 2, nameY);
        }
        
        // Draw main text
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000000';
        ctx.fillText(card.name, size / 2, nameY);
      }

      // Convert to blob URL
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ Front card rendered successfully');
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(null);
          }
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error rendering front card:', error);
      return null;
    }
  };

  // Render back side of card
  const renderBackCard = async (): Promise<string | null> => {
    try {
      console.log('🎯 Starting back card render with Canvas API...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Set canvas size to match preview exactly
      const size = 384;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);

      // Wait for fonts to be ready
      await waitForFonts();

      // Card styling constants
      const cardPadding = 16;
      const cardRadius = 24;
      const borderWidth = 2;

      // Draw theme background first
      const backgroundSrc = getBackgroundImage(deckTheme);
      if (backgroundSrc) {
        try {
          const backgroundImg = await loadImage(backgroundSrc);
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, cardRadius);
          ctx.clip();
          ctx.drawImage(backgroundImg, 0, 0, size, size);
          ctx.restore();
        } catch (error) {
          console.warn('Could not load background image:', error);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, cardRadius);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, cardRadius);
        ctx.fill();
      }

      // Draw card border
      if (deckTheme !== 'rainbow') {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'; // art-blue/30 for back
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        ctx.roundRect(borderWidth/2, borderWidth/2, size - borderWidth, size - borderWidth, cardRadius);
        ctx.stroke();
      }

      // Draw white content area (matching preview)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(cardPadding, cardPadding, size - (cardPadding * 2), size - (cardPadding * 2), 16);
      ctx.fill();

      // Draw attributes with exact styling from preview
      const fontFamily = getFontFamily(deckFont);
      const fontSize = deckFont === 'bubblegum' ? 16 : 14;
      const titleFontSize = deckFont === 'bubblegum' ? 20 : 16;
      
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Grid layout for attributes (2 columns)
      let yOffset = 60;
      const spacing = 80;
      const gridCols = 2;
      let col = 0;

      // Helper function to draw attribute
      const drawAttribute = (emoji: string, title: string, value: string, color: string) => {
        const x = col === 0 ? 120 : 264;
        const y = yOffset;

        // Draw emoji
        ctx.font = `24px Arial`;
        ctx.fillStyle = '#000000';
        ctx.fillText(emoji, x, y);

        // Draw title
        ctx.font = `${titleFontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.fillText(title, x, y + 32);

        // Draw value
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = '#000000';
        ctx.fillText(value, x, y + 56);

        col++;
        if (col >= gridCols) {
          col = 0;
          yOffset += spacing;
        }
      };

      // Draw attributes with exact colors from preview
      if (card.relationship?.trim()) {
        drawAttribute('🏠', 'Where they live', card.relationship, '#60a5fa');
      }

      if (card.dateOfBirth) {
        const [year, month, day] = card.dateOfBirth.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dayNum = date.getDate();
        const monthName = date.toLocaleDateString('en-US', { month: 'long' });
        const suffix = dayNum === 1 || dayNum === 21 || dayNum === 31 ? 'st' 
                     : dayNum === 2 || dayNum === 22 ? 'nd'
                     : dayNum === 3 || dayNum === 23 ? 'rd'
                     : 'th';
        const formattedDate = `${monthName} ${dayNum}${suffix}`;
        drawAttribute('🎂', 'Birthday', formattedDate, '#4ade80');
      }

      if (card.favoriteColor?.trim()) {
        drawAttribute('🎨', 'Favorite Color', card.favoriteColor, '#a855f7');
      }

      if (card.hobbies?.trim()) {
        // Show only first hobby to match preview
        const firstHobby = card.hobbies.split(',')[0].trim();
        drawAttribute('🌟', 'Hobbies', firstHobby, '#f97316');
      }

      // Draw fun fact if available (matching preview styling)
      if (card.funFact?.trim()) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
        ctx.beginPath();
        ctx.roundRect(48, yOffset, size - 96, 80, 16);
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fun fact emoji
        ctx.font = `20px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText('✨', size / 2, yOffset + 16);

        // Fun fact title
        ctx.font = `${titleFontSize}px ${fontFamily}`;
        ctx.fillStyle = '#ef4444';
        ctx.fillText('Fun Fact', size / 2, yOffset + 40);

        // Fun fact text (truncated to match preview)
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = '#000000';
        const truncatedFact = card.funFact.length > 40 ? 
          card.funFact.substring(0, 40) : 
          card.funFact;
        ctx.fillText(truncatedFact, size / 2, yOffset + 64);
      }

      // Convert to blob URL
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ Back card rendered successfully');
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(null);
          }
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error rendering back card:', error);
      return null;
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    generateFrontImage: renderFrontCard,
    generateBackImage: renderBackCard
  }));

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'none' }}
      width={384}
      height={384}
    />
  );
});
