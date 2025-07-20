# Supabase Storage Integration for High-Resolution Card Images

This document describes the implementation of Supabase Storage integration for storing high-resolution card images suitable for professional printing.

## Overview

The enhanced Kindred Cards application now stores card images as high-resolution files in Supabase Storage instead of base64 strings in the browser state. This enables:

- **High-resolution printing** (up to 2400x2400px at 90% quality)
- **Persistent storage** across sessions and devices
- **Efficient data transfer** using URLs instead of large base64 strings
- **Automatic migration** from existing base64 images
- **Session-based cart management** for guest users

## Architecture

### Database Schema

```sql
-- Individual cards table for high-resolution storage
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id TEXT,                    -- Guest user session tracking
  user_id UUID REFERENCES auth.users(id),  -- Authenticated user ID
  name TEXT NOT NULL,
  relationship TEXT,
  date_of_birth DATE,
  favorite_color TEXT,
  hobbies TEXT,
  fun_fact TEXT,
  photo_url TEXT,                          -- High-res image URL
  photo_storage_path TEXT,                 -- Storage path for management
  image_position JSONB,                    -- {x, y, scale} positioning
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  order_id UUID REFERENCES orders(id),     -- Link to orders for printing
  is_draft BOOLEAN DEFAULT true            -- Draft vs. ordered status
);
```

### Storage Configuration

- **Bucket**: `card-images`
- **File size limit**: 10MB
- **Supported formats**: JPEG, PNG, WebP, HEIC
- **Processing**: Auto-resize to max 2400x2400px with 90% quality
- **Access**: Public read, authenticated write

## Key Components

### 1. Enhanced Card Hook (`useEnhancedCards`)

Replaces the previous `useSupabaseCards` with:
- High-resolution image upload handling
- Session-based guest user support
- Automatic base64 migration
- Database persistence with image URLs

```typescript
const { cards, addCard, updateCard, removeCard, isLoaded, isSaving } = useEnhancedCards();
```

### 2. Storage Utilities (`lib/supabase-storage.ts`)

Provides functions for:
- `uploadCardImage()` - High-resolution image processing and upload
- `deleteCardImage()` - Cleanup of deleted images
- `migrateBase64ToStorage()` - Migration from existing base64 data
- `processImageForPrint()` - Image optimization for printing

### 3. Updated Card Interface

```typescript
export interface FamilyCard {
  id: string;
  name: string;
  photo: string;           // Backward compatibility
  photo_url?: string;      // New Supabase Storage URL
  photoFile?: File;        // Temporary upload handling
  relationship?: string;   // Updated field name
  // ... other fields
}
```

## Workflow

### Card Creation Process

1. **User uploads image** → `CardForm` handles file selection
2. **File stored temporarily** → `photoFile` added to form data
3. **Preview generated** → Base64 for immediate display
4. **Form submission** → `addCard()` processes the upload:
   - Image processed for print quality (2400px, 90% quality)
   - Uploaded to Supabase Storage
   - Card saved to database with `photo_url`
   - Local state updated with new card

### Order Process

1. **User clicks "Order Cards"** → Cards prepared for printing
2. **High-res URLs used** → `photo_url` field prioritized over `photo`
3. **Print-ready data sent** → External printing service receives URLs
4. **Cards marked as ordered** → `is_draft` set to false, `order_id` linked

### Session Management

**Guest Users:**
- Session ID stored in localStorage
- Cards linked to `user_session_id`
- Persistent across browser sessions

**Authentication Migration:**
- `migrateSessionCards()` transfers guest cards to user account
- Session cards linked to `user_id`
- `user_session_id` cleared after migration

## Migration Strategy

### Automatic Base64 Migration

Existing cards with base64 photos are automatically migrated:

```typescript
// During card operations, check for base64 images
if (card.photo.startsWith('data:') && !card.photo_url) {
  const result = await migrateBase64ToStorage(card.photo, user?.id);
  // Update card with new photo_url
}
```

### Backward Compatibility

- Existing `photo` field maintained for compatibility
- `photo_url` takes precedence when available
- Card components handle both formats seamlessly

## Image Processing

### Print Quality Standards

- **Resolution**: Up to 2400x2400 pixels
- **Quality**: 90% JPEG compression
- **Aspect ratio**: Preserved during resizing
- **Format**: JPEG for optimal print compatibility

### Processing Pipeline

```typescript
const processImageForPrint = async (file: File) => {
  // Canvas-based processing with high-quality settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // Resize maintaining aspect ratio
  // Output as high-quality JPEG
};
```

## Security

### Row Level Security (RLS)

```sql
-- Users can view their own cards or session cards
CREATE POLICY "users_can_view_own_cards" ON cards
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (user_session_id IS NOT NULL AND user_id IS NULL)
  );
```

### Storage Policies

- **Public read**: Anyone can view images via URL
- **Authenticated write**: Only logged-in users can upload
- **User-scoped paths**: Images stored in user-specific folders

## Environment Setup

Required environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Migration

Apply the migration to set up the new schema:

```bash
# Apply the cards table migration
npx supabase migration up
```

The migration file: `20250127000000-add-cards-table-for-printing.sql`

## Testing Checklist

- [ ] Image upload works for guest users
- [ ] Images persist across browser sessions
- [ ] Authentication migrates guest cards
- [ ] High-resolution images download correctly
- [ ] Order process uses `photo_url` for printing
- [ ] Base64 images migrate automatically
- [ ] Card deletion removes associated images
- [ ] Session cleanup works correctly

## Performance Considerations

### Optimizations

- **Lazy loading**: Images loaded on demand
- **CDN delivery**: Supabase CDN for fast image delivery
- **Efficient queries**: Indexed database queries
- **Background processing**: Image upload doesn't block UI

### Monitoring

- Monitor storage usage in Supabase dashboard
- Track upload success/failure rates
- Monitor migration completion

## Future Enhancements

### Planned Features

1. **Image transformations**: Supabase image transformations for different sizes
2. **Batch operations**: Bulk card import/export
3. **Print optimization**: Format-specific processing
4. **Advanced editing**: Image cropping and filters

### Print Service Integration

Cards are now ready for integration with professional printing services:

```typescript
const printCards = cards.map(card => ({
  ...card,
  printImageUrl: card.photo_url, // High-res URL for printing
  imagePosition: card.imagePosition // Positioning data
}));
```

## Troubleshooting

### Common Issues

1. **Upload failures**: Check network connectivity and file size limits
2. **Migration issues**: Verify RLS policies and authentication
3. **Image quality**: Ensure original images meet minimum resolution
4. **Storage limits**: Monitor Supabase storage quota

### Debug Mode

Enable debug logging:

```typescript
console.log('📸 Uploading image:', fileName);
console.log('✅ Upload successful:', result.url);
```

## Conclusion

This implementation provides a robust foundation for professional card printing with high-resolution images, persistent storage, and seamless user experience across guest and authenticated sessions.