
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

// Enhanced text wrapping helper for canvas with proper handling of edge cases
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  if (!text || text.trim() === '') return [''];
  
  const words = text.trim().split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine === '' ? word : currentLine + ' ' + word;
    const width = ctx.measureText(testLine).width;
    
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine === '') {
        // If single word is too wide, force it
        lines.push(word);
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
  }
  
  if (currentLine !== '') {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
};

// Enhanced text drawing function with precise positioning
const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  textAlign: CanvasTextAlign = 'center'
): number => {
  ctx.textAlign = textAlign;
  const lines = wrapText(ctx, text, maxWidth);
  
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + (index * lineHeight));
  });
  
  return y + (lines.length * lineHeight);
};

// CSS to Canvas font size mapping (avoid double DPI scaling; ctx.scale handles DPR)
const mapCSSFontToCanvas = (cssSize: number, fontFamily: string, dpr: number): string => {
  // Adjust for font family differences between CSS and Canvas
  const fontAdjustment = fontFamily.includes('Bubblegum') ? 0.9 :
                         fontFamily.includes('Luckiest') ? 0.85 :
                         fontFamily.includes('Fredoka') ? 0.9 : 1.0;

  // Do NOT multiply by dpr here; ctx.scale(dpr, dpr) already applied
  void dpr; // avoid unused param warning
  const finalSize = Math.round(cssSize * fontAdjustment);

  return `${finalSize}px ${fontFamily}`;
};

// Wait for fonts to load
const waitForFonts = async () => {
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 100));
};

// Get preview container dimensions dynamically
const getPreviewDimensions = () => {
  // Look for the preview container in the DOM
  const previewContainer = document.querySelector('.aspect-square');
  if (previewContainer) {
    const rect = previewContainer.getBoundingClientRect();
    console.log('📐 Preview container dimensions:', { width: rect.width, height: rect.height });
    return { width: rect.width, height: rect.height };
  }
  
  // Fallback to fixed dimensions
  console.log('📐 Using fallback dimensions: 384x384');
  return { width: 384, height: 384 };
};

// Draw background with proper CSS background-size: cover behavior
const drawBackgroundImage = (
  ctx: CanvasRenderingContext2D,
  backgroundImg: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  borderRadius: number
) => {
  // Calculate scale to cover the canvas (like CSS background-size: cover)
  const scaleX = canvasWidth / backgroundImg.width;
  const scaleY = canvasHeight / backgroundImg.height;
  const scale = Math.max(scaleX, scaleY); // Use max to ensure full coverage
  
  // Calculate dimensions of scaled image
  const scaledWidth = backgroundImg.width * scale;
  const scaledHeight = backgroundImg.height * scale;
  
  // Calculate position to center the image (like CSS background-position: center)
  const x = (canvasWidth - scaledWidth) / 2;
  const y = (canvasHeight - scaledHeight) / 2;
  
  console.log('🎨 Background image scaling:', {
    originalSize: { width: backgroundImg.width, height: backgroundImg.height },
    scale,
    scaledSize: { width: scaledWidth, height: scaledHeight },
    position: { x, y }
  });
  
  // Clip to rounded rectangle
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, canvasWidth, canvasHeight, borderRadius);
  ctx.clip();
  
  // Draw the scaled and positioned background image
  ctx.drawImage(backgroundImg, x, y, scaledWidth, scaledHeight);
  
  ctx.restore();
};

// Calculate exact photo area dimensions matching flexbox behavior
const calculatePhotoArea = (canvasWidth: number, canvasHeight: number, cardPadding: number) => {
  // In the preview, the photo area uses flex-1 and the name area has fixed height
  // Name area is h-16 (64px) in the preview
  const nameAreaHeight = 64;
  
  // Photo area takes remaining space after padding and name area
  const photoAreaWidth = canvasWidth - (cardPadding * 2);
  const photoAreaHeight = canvasHeight - (cardPadding * 2) - nameAreaHeight;
  
  return {
    x: cardPadding,
    y: cardPadding,
    width: photoAreaWidth,
    height: photoAreaHeight
  };
};

// Draw photo with exact CSS background-image positioning
const drawPhotoImage = (
  ctx: CanvasRenderingContext2D,
  photoImg: HTMLImageElement,
  photoArea: { x: number; y: number; width: number; height: number },
  imagePosition: { scale: number; x: number; y: number } | undefined,
  borderRadius: number
) => {
  // Draw white border around photo area (matching preview's border-4 border-white)
  const photoBorderWidth = 4;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(
    photoArea.x - photoBorderWidth,
    photoArea.y - photoBorderWidth,
    photoArea.width + (photoBorderWidth * 2),
    photoArea.height + (photoBorderWidth * 2),
    borderRadius
  );
  ctx.fill();
  
  // Clip to photo area
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height, borderRadius);
  ctx.clip();
  
  if (imagePosition) {
    // Use exact same positioning logic as CSS background-image
    const scale = imagePosition.scale;
    const offsetX = imagePosition.x;
    const offsetY = imagePosition.y;
    
    // Calculate background-size equivalent
    const backgroundWidth = photoImg.width / scale;
    const backgroundHeight = photoImg.height / scale;
    
    // Calculate scale to fit the photo area (like CSS background-size)
    const scaleToFit = Math.max(
      photoArea.width / backgroundWidth,
      photoArea.height / backgroundHeight
    );
    
    const finalWidth = backgroundWidth * scaleToFit;
    const finalHeight = backgroundHeight * scaleToFit;
    
    // Calculate background-position equivalent
    const positionX = 50 + (offsetX / (3.6 * scale));
    const positionY = 50 + (offsetY / (3.6 * scale));
    
    // Convert percentage to pixels
    const x = photoArea.x + ((photoArea.width - finalWidth) * (positionX / 100));
    const y = photoArea.y + ((photoArea.height - finalHeight) * (positionY / 100));
    
    console.log('📷 Photo positioning:', {
      imagePosition,
      backgroundSize: { width: backgroundWidth, height: backgroundHeight },
      scaleToFit,
      finalSize: { width: finalWidth, height: finalHeight },
      position: { x, y }
    });
    
    ctx.drawImage(photoImg, x, y, finalWidth, finalHeight);
  } else {
    // Default cover positioning
    const scale = Math.max(
      photoArea.width / photoImg.width,
      photoArea.height / photoImg.height
    );
    
    const scaledWidth = photoImg.width * scale;
    const scaledHeight = photoImg.height * scale;
    
    const x = photoArea.x + (photoArea.width - scaledWidth) / 2;
    const y = photoArea.y + (photoArea.height - scaledHeight) / 2;
    
    ctx.drawImage(photoImg, x, y, scaledWidth, scaledHeight);
  }
  
  ctx.restore();
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

      // Get actual preview dimensions
      const { width: previewWidth, height: previewHeight } = getPreviewDimensions();
      
      // Set canvas size to match preview exactly
      const dpr = window.devicePixelRatio || 1;
      canvas.width = previewWidth * dpr;
      canvas.height = previewHeight * dpr;
      ctx.scale(dpr, dpr);

      // Wait for fonts to be ready
      await waitForFonts();

      // Card styling constants to match preview exactly
      const cardPadding = 16; // p-4 in preview
      const cardRadius = 24; // rounded-3xl
      const borderWidth = 2; // border-2
      
      // Calculate photo area dimensions using exact preview layout
      const photoArea = calculatePhotoArea(previewWidth, previewHeight, cardPadding);
      
      console.log('📐 Canvas dimensions:', {
        preview: { width: previewWidth, height: previewHeight },
        canvas: { width: canvas.width, height: canvas.height },
        photoArea
      });

      // Draw theme background with proper CSS cover behavior
      const backgroundSrc = getBackgroundImage(deckTheme);
      if (backgroundSrc) {
        try {
          const backgroundImg = await loadImage(backgroundSrc);
          drawBackgroundImage(ctx, backgroundImg, previewWidth, previewHeight, cardRadius);
        } catch (error) {
          console.warn('Could not load background image:', error);
          // Fallback to white background
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(0, 0, previewWidth, previewHeight, cardRadius);
          ctx.fill();
        }
      } else {
        // Draw white background if no theme
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(0, 0, previewWidth, previewHeight, cardRadius);
        ctx.fill();
      }

      // Draw card border (matching preview border styling)
      if (deckTheme !== 'rainbow') {
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)'; // art-pink/30
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        ctx.roundRect(borderWidth/2, borderWidth/2, previewWidth - borderWidth, previewHeight - borderWidth, cardRadius);
        ctx.stroke();
      }

      // Draw photo with exact positioning from preview
      if (card.photo) {
        try {
          const photoImg = await loadImage(card.photo);
          drawPhotoImage(ctx, photoImg, photoArea, card.imagePosition, 16);
        } catch (error) {
          console.warn('Could not load photo:', error);
          // Draw placeholder matching preview
          const placeholderSize = 128;
          const placeholderX = (previewWidth - placeholderSize) / 2;
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

      // Draw name with CSS-equivalent font sizing (avoid double DPR scaling)
      if (card.name) {
        const fontFamily = getFontFamily(deckFont);
        // Use Tailwind's text-3xl ≈ 30px; mapCSSFontToCanvas adjusts per font family
        ctx.font = mapCSSFontToCanvas(30, fontFamily, dpr);
        console.log('📝 Name ctx.font:', ctx.font, 'dpr:', dpr);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Position text in name area at bottom (64px height area)
        const nameY = previewHeight - 32; // Center of 64px name area
        
        // Create text shadow effect matching CSS
        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw multiple shadow layers for stronger effect
        for (let i = 0; i < 3; i++) {
          ctx.shadowBlur = 30 - (i * 10);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(card.name, previewWidth / 2, nameY);
        }
        
        // Draw main text
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000000';
        ctx.fillText(card.name, previewWidth / 2, nameY);
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
      console.log('🎯 Starting back card render with Canvas API - v2 (no sparkle)...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Could not get canvas context');
        return null;
      }

      // Get actual preview dimensions
      const { width: previewWidth, height: previewHeight } = getPreviewDimensions();
      
      // Set canvas size to match preview exactly
      const dpr = window.devicePixelRatio || 1;
      canvas.width = previewWidth * dpr;
      canvas.height = previewHeight * dpr;
      ctx.scale(dpr, dpr);

      // Wait for fonts to be ready
      await waitForFonts();

      // Card styling constants
      const cardPadding = 16;
      const cardRadius = 24;
      const borderWidth = 2;

      // Add drop shadow before drawing the main card shape
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;

      // Draw theme background with proper CSS cover behavior
      const backgroundSrc = getBackgroundImage(deckTheme);
      if (backgroundSrc) {
        try {
          const backgroundImg = await loadImage(backgroundSrc);
          drawBackgroundImage(ctx, backgroundImg, previewWidth, previewHeight, cardRadius);
        } catch (error) {
          console.warn('Could not load background image:', error);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(0, 0, previewWidth, previewHeight, cardRadius);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(0, 0, previewWidth, previewHeight, cardRadius);
        ctx.fill();
      }

      // Draw card border
      if (deckTheme !== 'rainbow') {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'; // art-blue/30 for back
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        ctx.roundRect(borderWidth/2, borderWidth/2, previewWidth - borderWidth, previewHeight - borderWidth, cardRadius);
        ctx.stroke();
      }

      // Clear shadow for internal elements
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw white content area (matching preview)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(cardPadding, cardPadding, previewWidth - (cardPadding * 2), previewHeight - (cardPadding * 2), 16);
      ctx.fill();

      ctx.restore();

      // Draw attributes with precise font sizing to match preview exactly  
      const fontFamily = getFontFamily(deckFont);
      
      // Apply additional back-side scaling
      const BACK_FONT_SCALE = 0.8;
      const emojiSize = 20 * BACK_FONT_SCALE;
      const titleBase = deckFont === 'bubblegum' ? 16 : 14;
      const titleSize = titleBase * BACK_FONT_SCALE;
      const valueSize = 16 * BACK_FONT_SCALE;
      const funFactSize = 14 * BACK_FONT_SCALE;

      // Use precise CSS-to-Canvas font mapping to match preview exactly
      const emojiFont = mapCSSFontToCanvas(emojiSize, 'Arial', dpr);
      const titleFont = mapCSSFontToCanvas(titleSize, fontFamily, dpr);
      const valueFont = mapCSSFontToCanvas(valueSize, fontFamily, dpr); // text-base scaled
      console.log('🔎 Back font sizes:', { dpr, emojiSize, titleSize, valueSize, funFactSize, fontFamily });
      // Content area dimensions matching HTML exactly
      const contentPadding = cardPadding + 16; // p-4 = 16px padding
      const contentWidth = previewWidth - (contentPadding * 2);
      const contentHeight = previewHeight - (contentPadding * 2);
      
      // Collect visible attributes first to calculate grid center position
      const visibleAttributes: Array<{emoji: string, title: string, value: string, color: string}> = [];
      
      if (card.relationship?.trim()) {
        visibleAttributes.push({emoji: '🏠', title: 'Where they live', value: card.relationship, color: '#60a5fa'});
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
        visibleAttributes.push({emoji: '🎂', title: 'Birthday', value: formattedDate, color: '#4ade80'});
      }
      if (card.favoriteColor?.trim()) {
        visibleAttributes.push({emoji: '🎨', title: 'Favorite Color', value: card.favoriteColor, color: '#a855f7'});
      }
      if (card.hobbies?.trim()) {
        const firstHobby = card.hobbies.split(',')[0].trim();
        visibleAttributes.push({emoji: '🌟', title: 'Hobbies', value: firstHobby, color: '#f97316'});
      }
      
      // CSS Grid layout with gap-3 (12px) and content-center
      const gridGap = 12; // gap-3 = 12px
      const cellWidth = (contentWidth - gridGap) / 2; // Two columns with gap
      const gridRows = Math.ceil(visibleAttributes.length / 2);
      const singleItemHeight = Math.round(70 * BACK_FONT_SCALE); // scaled for tighter layout
      const totalGridHeight = (gridRows * singleItemHeight) + ((gridRows - 1) * gridGap);
      
      // Center the grid vertically in available space (content-center behavior)
      const funFactHeight = card.funFact?.trim() ? 100 : 0;
      const funFactMargin = card.funFact?.trim() ? 16 : 0; // margin between grid and fun fact
      const availableHeight = contentHeight - funFactHeight - funFactMargin;
      const gridStartY = contentPadding + (availableHeight - totalGridHeight) / 2;
      
      // Helper function to draw attribute with precise CSS Grid positioning
      const drawAttribute = (attributeData: {emoji: string, title: string, value: string, color: string}, index: number) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        
        // Calculate exact grid position
        const cellX = contentPadding + (col * (cellWidth + gridGap));
        const cellY = gridStartY + (row * (singleItemHeight + gridGap));
        const centerX = cellX + (cellWidth / 2);
        
        ctx.textAlign = 'center';

        // Draw emoji (text-xl scaled)
        ctx.font = emojiFont;
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'top';
        ctx.fillText(attributeData.emoji, centerX, cellY);

        // Draw title with mb-1 spacing (4px)
        ctx.font = titleFont;
        ctx.fillStyle = attributeData.color;
        ctx.textBaseline = 'top';
        const titleY = cellY + Math.round(emojiSize + 4);
        ctx.fillText(attributeData.title, centerX, titleY);

        // Draw value with mb-1 spacing (4px)
        ctx.font = valueFont;
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'top';
        const valueY = titleY + Math.round(titleSize + 4);
        const valueLineHeight = Math.max(12, Math.round(valueSize * 1.2));
        drawWrappedText(ctx, attributeData.value, centerX, valueY, cellWidth, valueLineHeight, 'center');
      };

      // Draw all visible attributes using the grid layout
      visibleAttributes.forEach((attributeData, index) => {
        drawAttribute(attributeData, index);
      });

      // Draw fun fact if available with exact DOM styling
      if (card.funFact?.trim()) {
        // Calculate proper dimensions - full width with margins like col-span-2
        const funFactPadding = 12; // p-3 = 12px padding
        const funFactMargin = 24; // mx-6 equivalent
        const funFactWidth = previewWidth - (funFactMargin * 2);
        
        // Calculate height based on content - need room for emoji, title, and text
        const funFactHeight = 100; // Increased height for proper spacing
        
        const funFactX = funFactMargin;
        // Position fun fact below the grid with proper spacing
        const funFactY = gridStartY + totalGridHeight + funFactMargin;
        
        // Draw background with exact Tailwind colors: bg-yellow-100/80
        ctx.fillStyle = 'rgba(254, 243, 199, 0.8)'; // #fef3c7 with 80% opacity
        ctx.beginPath();
        ctx.roundRect(funFactX, funFactY, funFactWidth, funFactHeight, 16); // rounded-2xl = 16px
        ctx.fill();

        // Draw border with exact Tailwind color: border-yellow-300
        ctx.strokeStyle = '#fde047'; // yellow-300
        ctx.lineWidth = 2;
        ctx.stroke();

        // Calculate center point for proper text positioning
        const centerX = funFactX + (funFactWidth / 2);
        const contentStartY = funFactY + funFactPadding;

        // NO EMOJI for fun fact - this should match the preview exactly
        console.log('🔍 Drawing Fun Fact without emoji...');

        // Fun fact title - positioned at top with proper spacing (no emoji above)
        ctx.font = titleFont;
        ctx.fillStyle = '#f87171'; // text-red-400 exact color
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Fun Fact', centerX, contentStartY + 4); // mb-1 = 4px spacing

        // Fun fact text - positioned below title with proper spacing
        ctx.font = mapCSSFontToCanvas(funFactSize, fontFamily, dpr);
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Handle text wrapping with scaled line height (leading-relaxed = 1.625)
        const maxWidth = funFactWidth - (funFactPadding * 2);
        const funFactLineHeight = funFactSize * 1.625; // scaled line height
        const funFactTextY = contentStartY + 4 + Math.round(titleSize) + 4; // below title
        console.log('🔎 Fun Fact font:', { funFactSize, funFactLineHeight, funFactTextY });
        drawWrappedText(ctx, card.funFact, centerX, funFactTextY, maxWidth, funFactLineHeight, 'center');
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
