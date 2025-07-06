# Security Testing Guide - Kindred Cards

## 🧪 Complete Security Testing Checklist

This guide will help you test all the security improvements to ensure they're working correctly.

## 🚀 Setup for Testing

### 1. Environment Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your Supabase credentials
# Replace the placeholder values with your actual Supabase URL and key

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:5173
```

### 2. Required Test Files
Create these test files for upload testing:

**Valid Test Files:**
- `test-image.jpg` (small JPEG, < 1MB)
- `test-image.png` (small PNG, < 1MB)

**Invalid Test Files:**
- `large-image.jpg` (> 5MB - use online tools to create)
- `test-document.pdf` (PDF file)
- `test-file.txt` (text file)

## 🔐 Testing Authentication Security

### Test 1: Password Strength Validation

1. **Navigate to Sign Up page:**
   - Go to `/auth`
   - Click "Sign Up" tab

2. **Test Weak Passwords:**
   ```
   Test Cases:
   ❌ "123456" - Should show "Very Weak" + requirements
   ❌ "password" - Should detect common word
   ❌ "Abc123" - Should ask for special characters
   ❌ "abcdefgh" - Should ask for numbers/uppercase
   ✅ "MyStr0ng!Pass" - Should show "Strong" ✓ Valid
   ```

3. **Expected Behavior:**
   - Real-time strength indicator updates
   - Color changes: Red → Orange → Yellow → Green
   - Feedback messages appear/disappear
   - Submit button only works with valid passwords

### Test 2: Email Validation

1. **Test Invalid Emails:**
   ```
   Test Cases:
   ❌ "notanemail" - Should show error
   ❌ "test@" - Should show error
   ❌ "@domain.com" - Should show error
   ✅ "test@example.com" - Should be accepted
   ```

2. **Expected Behavior:**
   - Red border appears on invalid emails
   - Error message shows below field
   - Error disappears when typing valid email

### Test 3: Rate Limiting

1. **Test Sign-In Rate Limiting:**
   ```bash
   # Method 1: Use developer tools
   1. Open browser DevTools (F12)
   2. Go to Console tab
   3. Run this script to simulate multiple failures:
   
   for(let i = 0; i < 6; i++) {
     setTimeout(() => {
       // Try signing in with wrong credentials
       console.log(`Attempt ${i + 1}`);
     }, i * 1000);
   }
   ```

2. **Manual Testing:**
   - Try signing in with wrong email/password 6 times
   - On 6th attempt, should see rate limit message
   - Should show countdown timer

3. **Expected Behavior:**
   - First 5 attempts: Normal error messages
   - 6th attempt: "Too many attempts. Please try again in X minutes."
   - Input fields should remain functional
   - Timer counts down properly

### Test 4: Input Sanitization

1. **Test XSS Prevention:**
   ```html
   Test Inputs:
   ❌ "<script>alert('xss')</script>"
   ❌ "<img src=x onerror=alert(1)>"
   ❌ "javascript:alert(1)"
   ❌ "<h1>HTML Tag</h1>"
   ```

2. **Where to Test:**
   - Name field in sign-up
   - All fields in card creation form
   - Profile information

3. **Expected Behavior:**
   - HTML tags should be stripped
   - JavaScript should be removed
   - Data should be sanitized in preview

## 📁 Testing File Upload Security

### Test 5: File Type Validation

1. **Navigate to Card Creation:**
   - Go to `/create`
   - Click "Add New Card"

2. **Test File Types:**
   ```
   ✅ test-image.jpg - Should upload successfully
   ✅ test-image.png - Should upload successfully
   ✅ test-image.gif - Should upload successfully
   ✅ test-image.webp - Should upload successfully
   ❌ test-document.pdf - Should show error
   ❌ test-file.txt - Should show error
   ❌ test-audio.mp3 - Should show error
   ```

3. **Expected Behavior:**
   - Valid files: Green success message + preview
   - Invalid files: Red error message
   - File input should accept only image types

### Test 6: File Size Validation

1. **Test Large Files:**
   ```
   ❌ Upload file > 5MB - Should show "File size must be less than 5MB"
   ✅ Upload file < 5MB - Should work normally
   ```

2. **Create Large Test File:**
   ```bash
   # Use online tools or camera to create large image
   # Or use command line (Mac/Linux):
   # dd if=/dev/zero of=large-test.jpg bs=1M count=6
   ```

3. **Expected Behavior:**
   - Shows loading spinner during validation
   - Large files rejected with clear error message
   - Small files process normally

### Test 7: Image Dimension Validation

1. **Test Large Dimensions:**
   - Try uploading very high-resolution images (> 4000x4000 pixels)
   - Should show dimension error

2. **Expected Behavior:**
   - Error: "Image dimensions must be less than 4000x4000 pixels"
   - File rejected before processing

## 🛡️ Testing Security Headers

### Test 8: Security Headers Verification

1. **Using Browser DevTools:**
   ```bash
   1. Open DevTools (F12)
   2. Go to Network tab
   3. Refresh page
   4. Click on main document request
   5. Check Response Headers
   ```

2. **Expected Headers:**
   ```http
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   X-XSS-Protection: 1; mode=block
   Referrer-Policy: strict-origin-when-cross-origin
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   Content-Security-Policy: [long policy string]
   ```

3. **Online Security Testing:**
   ```bash
   # Use these tools after deployment:
   - https://securityheaders.com/
   - https://observatory.mozilla.org/
   ```

### Test 9: Content Security Policy (CSP)

1. **Test CSP Enforcement:**
   - Open browser console
   - Try to execute inline script: `eval('alert("test")')`
   - Should be blocked by CSP

2. **Expected Behavior:**
   - Console shows CSP violation errors
   - Inline scripts blocked
   - Only whitelisted sources allowed

## 🔍 Testing Error Messages

### Test 10: Information Disclosure Prevention

1. **Test Sign-In Errors:**
   ```
   Test Cases:
   ❌ Wrong email: "Invalid email or password..."
   ❌ Wrong password: "Invalid email or password..."
   ❌ Non-existent user: "Invalid email or password..."
   ```

2. **Test Sign-Up Errors:**
   ```
   Test Cases:
   ❌ Existing email: "An account with this email already exists..."
   ❌ Server error: "Unable to create account. Please try again later."
   ```

3. **Expected Behavior:**
   - Generic error messages
   - No specific details about what went wrong
   - Consistent messaging across all errors

## 🧹 Testing Anonymous User Management

### Test 11: Anonymous User Cleanup

1. **Test Anonymous Session:**
   ```bash
   # This is automatic but you can check:
   1. Go to /create without signing in
   2. Create some cards
   3. Check browser DevTools → Application → Session Storage
   4. Should see anonymousCleanup timer
   ```

2. **Expected Behavior:**
   - Anonymous users created automatically
   - Cards saved to anonymous session
   - Cleanup timer set for 24 hours

## 🌐 Testing Environment Variables

### Test 12: Environment Configuration

1. **Test Missing Environment Variables:**
   ```bash
   # Temporarily rename .env file
   mv .env .env.backup
   
   # Restart dev server
   npm run dev
   
   # Should see error about missing environment variables
   
   # Restore file
   mv .env.backup .env
   ```

2. **Expected Behavior:**
   - Clear error message about missing variables
   - Application doesn't start without proper configuration

## 📱 Cross-Browser Testing

### Test 13: Browser Compatibility

Test in multiple browsers:
- ✅ Chrome
- ✅ Firefox  
- ✅ Safari
- ✅ Edge

**Test Features:**
- Password strength indicator
- File upload validation
- Rate limiting
- Error messages

## 🚨 Security Penetration Testing

### Test 14: Advanced Security Testing

1. **SQL Injection Attempts:**
   ```sql
   # Try in form fields:
   '; DROP TABLE users; --
   ' OR '1'='1
   ```

2. **XSS Attempts:**
   ```html
   <script>alert('XSS')</script>
   <img src=x onerror=alert('XSS')>
   ```

3. **Expected Behavior:**
   - All malicious input sanitized
   - No script execution
   - Database queries protected by Supabase

## ✅ Testing Checklist

Copy this checklist for testing:

### Authentication Security
- [ ] Password strength indicator works
- [ ] Weak passwords rejected
- [ ] Email validation works
- [ ] Rate limiting triggers after 5 attempts
- [ ] Rate limit timer counts down
- [ ] Input sanitization prevents XSS

### File Upload Security
- [ ] Only image files accepted
- [ ] Large files (>5MB) rejected
- [ ] High-resolution images (>4000px) rejected
- [ ] Upload progress indicator shows
- [ ] Error messages clear and helpful

### Security Headers
- [ ] All security headers present
- [ ] CSP blocks inline scripts
- [ ] X-Frame-Options prevents embedding
- [ ] HTTPS enforced (in production)

### Error Handling
- [ ] Generic error messages (no info disclosure)
- [ ] Consistent error handling
- [ ] No sensitive data in errors

### Environment & Configuration
- [ ] Environment variables required
- [ ] No hardcoded secrets in code
- [ ] Application fails safely without config

## 🔧 Troubleshooting Common Issues

### Issue: Password indicator not showing
```bash
Solution: Check browser console for React/TypeScript errors
```

### Issue: File upload not working
```bash
Solution: 
1. Check file type and size
2. Look for validation errors in console
3. Verify file is actual image format
```

### Issue: Rate limiting not working
```bash
Solution:
1. Clear browser storage
2. Use different email addresses
3. Check console for JavaScript errors
```

### Issue: Environment variables not loading
```bash
Solution:
1. Verify .env file exists
2. Check variable names start with VITE_
3. Restart development server
```

## 📊 Expected Test Results

After running all tests, you should see:

### ✅ Success Indicators:
- Password strength changes colors appropriately
- Invalid files rejected with clear messages
- Rate limiting kicks in after 5 attempts
- All security headers present
- Generic error messages displayed
- Environment variables properly loaded

### ❌ Failure Indicators:
- Weak passwords accepted
- Invalid files uploaded successfully
- Unlimited login attempts allowed
- Missing security headers
- Specific error details revealed
- Hardcoded credentials in console

## 🎯 Performance Impact

The security improvements should have minimal performance impact:
- File validation: ~100ms per upload
- Password checking: Real-time with no lag
- Rate limiting: No impact on normal usage
- Input sanitization: Negligible impact

---

## 🚀 Ready for Production

Once all tests pass, your application is secure and ready for production deployment!

**Next Steps:**
1. Deploy to staging environment
2. Run tests again in staging
3. Deploy to production
4. Monitor security logs
5. Set up regular security audits