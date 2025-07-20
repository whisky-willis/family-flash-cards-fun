import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  url: string;
  path: string;
  error?: string;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Generate a unique session ID for guest users
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create a session ID for the current user
 */
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('kindred-cards-session-id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('kindred-cards-session-id', sessionId);
  }
  return sessionId;
};

/**
 * Process an image file to ensure it meets print quality requirements
 */
export const processImageForPrint = async (
  file: File,
  options: ImageProcessingOptions = {}
): Promise<File> => {
  const {
    maxWidth = 2400,  // High resolution for printing
    maxHeight = 2400,
    quality = 0.9,    // High quality for printing
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image with high quality settings
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now(),
              });
              resolve(processedFile);
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          `image/${format}`,
          quality
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Upload an image to Supabase Storage for high-resolution printing
 */
export const uploadCardImage = async (
  file: File,
  userId?: string
): Promise<ImageUploadResult> => {
  try {
    // Process image for print quality
    const processedFile = await processImageForPrint(file);
    
    // Generate file path
    const fileExt = processedFile.name.split('.').pop();
    const userFolder = userId || 'guest';
    const fileName = `${userFolder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    console.log('Uploading image to path:', fileName);
    
    const { data, error } = await supabase.storage
      .from('card-images')
      .upload(fileName, processedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('card-images')
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName
    };
  } catch (error) {
    console.error('Failed to upload image:', error);
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Delete an image from Supabase Storage
 */
export const deleteCardImage = async (path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('card-images')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete image:', error);
    return false;
  }
};

/**
 * Generate a print-ready image URL with transformations
 */
export const generatePrintImageUrl = (
  baseUrl: string,
  transformations: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  const {
    width = 1200,
    height = 1200,
    quality = 95,
    format = 'jpeg'
  } = transformations;

  // If Supabase adds image transformation support, we can enhance this
  // For now, return the original high-quality URL
  return baseUrl;
};

/**
 * Convert base64 image to File object (for migration)
 */
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

/**
 * Migrate existing base64 images to Supabase Storage
 */
export const migrateBase64ToStorage = async (
  base64Image: string,
  userId?: string
): Promise<ImageUploadResult> => {
  try {
    const file = base64ToFile(base64Image, 'migrated-image.jpg');
    return await uploadCardImage(file, userId);
  } catch (error) {
    console.error('Failed to migrate base64 image:', error);
    return {
      url: '',
      path: '',
      error: 'Migration failed'
    };
  }
};