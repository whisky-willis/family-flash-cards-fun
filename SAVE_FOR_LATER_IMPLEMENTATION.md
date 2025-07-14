# Save for Later Email Signup Implementation

## Overview
Added email signup functionality to the "Save for Later" feature in Kindred Cards, allowing users to create accounts via email verification and persist their draft cards.

## Components Added

### 1. EmailSignupModal (`src/components/EmailSignupModal.tsx`)
- **Purpose**: Dedicated modal for email-only signup when users click "Save for Later"
- **Features**:
  - Email validation (format, required field)
  - Supabase email signup integration
  - Draft card persistence to localStorage before signup
  - Success/error states with appropriate messaging
  - Mobile-responsive design
  - Loading states and proper UX feedback

### 2. AuthCallback Page (`src/pages/AuthCallback.tsx`)
- **Purpose**: Dedicated route to handle email verification redirects from Supabase
- **Features**:
  - Processes Supabase auth tokens automatically
  - Draft card migration from localStorage to user account
  - Visual feedback with loading, success, and error states
  - Automatic redirect to create-cards after successful verification
  - Comprehensive error handling and user guidance

## Modified Components

### CreateCards.tsx Updates
- **Import**: Added EmailSignupModal import
- **State**: Added `showEmailSignupModal` state
- **Handler**: Updated `handleSaveCollection()` to show EmailSignupModal instead of AuthModal for unauthenticated users
- **Success Handler**: Added `handleEmailSignupSuccess()` for post-signup feedback
- **JSX**: Added EmailSignupModal component alongside existing AuthModal

### App.tsx Updates
- **Routing**: Updated `/create` route to `/create-cards` for consistency
- **New Route**: Added `/auth-callback` route for email verification handling
- **Navigation**: All navigation links updated to use `/create-cards`

### useSupabaseCards.tsx Updates (Enhanced Migration System)
- **Fallback Migration Logic**: Comprehensive backup system for draft card migration
- **Email Validation**: Ensures only cards saved with verified email are migrated
- **Dual Format Support**: Handles both old (array) and new (object with email) draft formats
- **Aggressive Migration Triggers**: Runs for save_for_later users even if AuthCallback bypassed
- **localStorage Debugging**: Extensive logging and localStorage inspection for troubleshooting
- **Metadata Cleanup**: Removes signup_type metadata after successful migration
- **Error Recovery**: Graceful handling of malformed draft data or email mismatches

## Workflow

### 1. User Creates Cards
- User creates draft cards on the CreateCards page
- Cards are stored in component state and can be previewed

### 2. Save for Later Click
- User clicks "Save for Later" button
- If user is not authenticated, EmailSignupModal opens
- If user is already authenticated, cards save directly

### 3. Email Signup Process
- User enters email address
- Email validation occurs (format, required)
- Draft cards are saved to localStorage before signup
- Supabase Auth sends verification email
- Modal shows success state with email confirmation

### 4. Email Verification
- User clicks verification link in email
- Browser redirects to `/auth-callback` with Supabase auth tokens
- AuthCallback page processes authentication and migrates draft cards
- User sees success feedback and is automatically redirected to `/create-cards`
- User can continue creating cards with their saved collection

### 5. Error Handling
- Invalid email formats
- Duplicate email addresses
- Verification failures
- Card migration errors
- Network errors

## Technical Details

### Email Signup Configuration
```typescript
await supabase.auth.signUp({
  email: email,
  password: crypto.randomUUID(), // Random password for email-only signup
  options: {
    emailRedirectTo: `${window.location.origin}/auth-callback`,
    data: {
      signup_type: 'save_for_later',
      has_draft_cards: cards.length > 0
    }
  }
});
```

### Draft Card Persistence
- Cards saved to localStorage with key `kindred-cards-draft` including email association
- Draft data format: `{ cards: FamilyCard[], email: string, timestamp: number }`
- Email validation during verification ensures correct cards are migrated
- Backward compatibility with old draft format (cards only)
- Automatic cleanup after successful migration
- Error recovery if localStorage quota exceeded

### Email Verification Processing
```typescript
// In AuthCallback page - handles email verification redirect
const { data: { session }, error } = await supabase.auth.getSession();

if (session?.user?.user_metadata?.signup_type === 'save_for_later') {
  // Get draft cards for this specific verified email
  const draftCards = getDraftForEmail(session.user.email || '');
  
  if (draftCards && draftCards.length > 0) {
    // Save all draft cards as a single collection
    const cardsData = draftCards.map(card => {
      const { id, ...cardData } = card;
      return cardData;
    });
    
    const { data, error: insertError } = await supabase
      .from('card_collections')
      .insert({
        user_id: session.user.id,
        cards: cardsData,
        created_at: new Date().toISOString()
      })
      .select();
    
    clearDraft();
    navigate('/create-cards');
  }
}
```

### Email-Associated Draft Saving
```typescript
// In EmailSignupModal - save cards with email association
saveDraftToLocal(cards, email);

// In useDraft hook - enhanced draft format
const draftData: DraftData = {
  cards,
  email: email || draftEmail,
  timestamp: Date.now()
};
localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
```

## User Experience Features

### Mobile Responsive
- Modal adapts to smaller screens
- Touch-friendly button sizes
- Proper keyboard navigation

### Loading States
- Spinner animations during email sending
- Progress indicators during card migration
- Disabled states to prevent duplicate actions

### Toast Notifications
- Success messages for email sent
- Error messages for validation failures
- Confirmation for successful verification
- Card migration status updates

### Error Recovery
- Clear error messages with actionable guidance
- Fallback options for failed operations
- Contact support information for persistent issues

## Testing Requirements

### Manual Testing Checklist
- [ ] "Save for Later" button triggers EmailSignupModal
- [ ] Email validation works (format, required field)
- [ ] Valid email sends verification email
- [ ] Invalid email shows appropriate error
- [ ] Duplicate email shows specific error message
- [ ] Verification email is sent successfully
- [ ] Email verification link works (no 404 errors)
- [ ] AuthCallback page loads and processes verification correctly
- [ ] Draft cards are associated with the correct email address
- [ ] Email verification matches the email used for draft cards
- [ ] Draft cards migrate successfully to user account
- [ ] **Fallback migration works**: Cards migrate even if AuthCallback is bypassed
- [ ] User is automatically redirected to /create-cards after verification
- [ ] Welcome toast notification appears in create-cards
- [ ] Error states handled gracefully in AuthCallback
- [ ] Visual feedback provided during processing
- [ ] Console logs show email matching and card migration details
- [ ] **localStorage debugging**: All draft-related keys are visible in console
- [ ] **Email mismatch handling**: No migration if emails don't match
- [ ] Error states display correctly
- [ ] Mobile responsive design
- [ ] Toast notifications appear
- [ ] Existing auth flow remains unaffected

### Debugging Steps if Cards Don't Appear
1. **Check Browser Console**: Look for detailed migration logs
2. **Verify localStorage**: Confirm draft cards were saved with email
3. **Check Email Match**: Ensure verification email matches draft email
4. **Monitor Migration Triggers**: Confirm fallback migration attempts
5. **Database Verification**: Check if cards were actually saved to Supabase

### Email Configuration Requirements
- Supabase email templates configured
- Correct redirect URL in email templates
- SMTP settings configured for email delivery

## Security Considerations

### Generated Passwords
- Random UUID passwords for email-only accounts
- Users can set custom passwords later via password reset
- Prevents credential-based attacks

### Token Security
- Supabase handles secure token generation
- Tokens expire automatically
- Single-use verification tokens

### Data Protection
- Draft cards only in localStorage temporarily
- Automatic cleanup after migration
- No sensitive data in URL parameters