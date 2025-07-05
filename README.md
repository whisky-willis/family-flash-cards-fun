# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/667af52b-4168-4061-9214-fca21dad15cb

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/667af52b-4168-4061-9214-fca21dad15cb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/667af52b-4168-4061-9214-fca21dad15cb) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🔒 Security Features

This project implements comprehensive security measures to protect user data and prevent common vulnerabilities:

### Authentication Security
- **Strong Password Requirements**: 8+ characters with mixed case, numbers, and symbols
- **Rate Limiting**: Protection against brute force attacks (5 attempts per 15 minutes)
- **Input Sanitization**: XSS prevention and HTML tag removal
- **Generic Error Messages**: Prevents information disclosure to attackers

### File Upload Security
- **File Type Validation**: Only JPEG, PNG, GIF, and WebP files accepted
- **Size Limits**: Maximum 5MB file size
- **Dimension Limits**: Maximum 4000x4000 pixel dimensions
- **Secure Processing**: Validated file content and format checking

### Data Protection
- **Environment Variables**: API keys and secrets stored securely
- **Session Management**: Automatic session timeout and cleanup
- **CSRF Protection**: Token-based protection for form submissions
- **Anonymous User Management**: Automatic cleanup after 24 hours

### Security Headers
- **Content Security Policy (CSP)**: Prevents XSS and injection attacks
- **X-Frame-Options**: Prevents clickjacking attacks
- **Strict-Transport-Security**: Enforces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME type sniffing

### Development Security
- **Secure Dependencies**: Regular security audits and updates
- **Code Sanitization**: All user inputs are sanitized
- **Error Handling**: Comprehensive error handling without information disclosure

For detailed security implementation information, see:
- `AUTHENTICATION_SECURITY_REVIEW.md` - Security analysis and findings
- `SECURITY_IMPLEMENTATION_GUIDE.md` - Implementation details and deployment guide

## 🛡️ Security Best Practices

### For Developers
1. Never commit `.env` files to version control
2. Regularly update dependencies with security patches
3. Test all authentication flows thoroughly
4. Validate all user inputs on both client and server side
5. Use HTTPS in production environments

### For Deployment
1. Set environment variables in your hosting platform
2. Enable security headers (automatically configured)
3. Test file upload restrictions
4. Monitor for failed authentication attempts
5. Regularly audit security configurations

**Security Level**: HIGH ✅  
**Ready for Production**: YES ✅
