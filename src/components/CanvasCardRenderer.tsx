
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
  // Additional wait to ensure fonts are fully loaded
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

      // Set canvas size with high DPI support
      const size = 384;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);

      // Wait for fonts to be ready
      await waitForFonts();

      // Draw background
      const backgroundSrc = getBackgroundImage(deckTheme);
      if (backgroundSrc) {
        try {
          const backgroundImg = await loadImage(backgroundSrc);
          ctx.drawImage(backgroundImg, 0, 0, size, size);
        } catch (error) {
          console.warn('Could not load background image:', error);
          // Fallback to white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
        }
      } else {
        // White background if no theme
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
      }

      // Draw photo
      if (card.photo_url) {
        try {
          const photoImg = await loadImage(card.photo_url);
          
          // Calculate photo dimensions and position
          const photoArea = {
            x: 32,
            y: 32,
            width: size - 64,
            height: size - 128 // Leave space for name at bottom
          };

          // Apply image positioning if available
          let sourceX = 0, sourceY = 0, sourceWidth = photoImg.width, sourceHeight = photoImg.height;
          
          if (card.imagePosition) {
            const scale = card.imagePosition.scale;
            const offsetX = card.imagePosition.x;
            const offsetY = card.imagePosition.y;
            
            // Calculate source rectangle based on positioning
            const scaledWidth = photoImg.width / scale;
            const scaledHeight = photoImg.height / scale;
            
            sourceX = Math.max(0, (photoImg.width - scaledWidth) / 2 - offsetX);
            sourceY = Math.max(0, (photoImg.height - scaledHeight) / 2 - offsetY);
            sourceWidth = Math.min(scaledWidth, photoImg.width - sourceX);
            sourceHeight = Math.min(scaledHeight, photoImg.height - sourceY);
          }

          // Draw photo with rounded corners effect
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height, 16);
          ctx.clip();
          
          // Draw white border
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(photoArea.x - 4, photoArea.y - 4, photoArea.width + 8, photoArea.height + 8);
          
          // Draw photo
          ctx.drawImage(
            photoImg,
            sourceX, sourceY, sourceWidth, sourceHeight,
            photoArea.x, photoArea.y, photoArea.width, photoArea.height
          );
          ctx.restore();
        } catch (error) {
          console.warn('Could not load photo:', error);
          // Draw placeholder
          ctx.fillStyle = '#f3f4f6';
          ctx.beginPath();
          ctx.roundRect(120, 120, 144, 144, 72);
          ctx.fill();
        }
      }

      // Draw name text
      if (card.name) {
        const fontFamily = getFontFamily(deckFont);
        const fontSize = deckFont === 'bubblegum' ? 48 : 32;
        
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw text
        ctx.fillText(card.name, size / 2, size - 48);
        
        // Reset shadow
        ctx.shadowBlur = 0;
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

      // Set canvas size with high DPI support
      const size = 384;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);

      // Wait for fonts to be ready
      await waitForFonts();

      // Draw background
      const backgroundSrc = getBackgroundImage(deckTheme);
      if (backgroundSrc) {
        try {
          const backgroundImg = await loadImage(backgroundSrc);
          ctx.drawImage(backgroundImg, 0, 0, size, size);
        } catch (error) {
          console.warn('Could not load background image:', error);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
      }

      // Draw white content area
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(32, 32, size - 64, size - 64, 16);
      ctx.fill();

      // Draw attributes
      const fontFamily = getFontFamily(deckFont);
      const fontSize = deckFont === 'bubblegum' ? 16 : 14;
      const titleFontSize = deckFont === 'bubblegum' ? 20 : 16;
      
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

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

      // Draw attributes
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
        drawAttribute('🌟', 'Hobbies', card.hobbies, '#f97316');
      }

      // Draw fun fact if available (spans full width)
      if (card.funFact?.trim()) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
        ctx.beginPath();
        ctx.roundRect(48, yOffset, size - 96, 60, 16);
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

        // Fun fact text (truncated for space)
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = '#000000';
        const truncatedFact = card.funFact.length > 50 ? 
          card.funFact.substring(0, 50) + '...' : 
          card.funFact;
        ctx.fillText(truncatedFact, size / 2, yOffset + 60);
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
