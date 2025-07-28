import { useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';

export interface CaptureOptions {
  format?: 'png' | 'jpeg';
  quality?: number;
  pixelRatio?: number;
  backgroundColor?: string;
}

export const useCardCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  const captureCard = async (
    element: HTMLElement, 
    filename: string, 
    options: CaptureOptions = {}
  ): Promise<string | null> => {
    if (!element) {
      toast({
        title: "Error",
        description: "Card element not found",
        variant: "destructive",
      });
      return null;
    }

    setIsCapturing(true);

    try {
      const {
        format = 'png',
        quality = 0.9,
        pixelRatio = 2,
        backgroundColor = '#ffffff'
      } = options;

      const captureOptions = {
        quality,
        pixelRatio,
        backgroundColor,
        width: 400,
        height: 600,
      };

      let dataUrl: string;
      
      if (format === 'jpeg') {
        dataUrl = await toJpeg(element, captureOptions);
      } else {
        dataUrl = await toPng(element, captureOptions);
      }

      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Success",
        description: "Card downloaded successfully",
      });

      return dataUrl;
    } catch (error) {
      console.error('Error capturing card:', error);
      toast({
        title: "Error",
        description: "Failed to download card. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const captureBatch = async (
    elements: { element: HTMLElement; filename: string }[],
    options: CaptureOptions = {}
  ): Promise<void> => {
    setIsCapturing(true);

    try {
      for (let i = 0; i < elements.length; i++) {
        const { element, filename } = elements[i];
        await captureCard(element, `${filename}-${i + 1}`, options);
        
        // Small delay between captures to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Success",
        description: `${elements.length} cards downloaded successfully`,
      });
    } catch (error) {
      console.error('Error in batch capture:', error);
      toast({
        title: "Error",
        description: "Some cards failed to download",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  return { 
    captureCard, 
    captureBatch, 
    isCapturing 
  };
};