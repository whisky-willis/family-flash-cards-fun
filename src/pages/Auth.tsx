import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { validateEmail, validatePassword, RateLimiter, sanitizeInput } from '@/lib/validation';

// Create a singleton rate limiter for auth attempts
const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailError('');
    
    // Rate limiting check
    const userKey = `signup_${email}`;
    if (!authRateLimiter.isAllowed(userKey)) {
      const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(userKey) / 1000 / 60);
      setError(`Too many attempts. Please try again in ${remainingTime} minutes.`);
      setRateLimited(true);
      setLoading(false);
      return;
    }
    
    // Validate inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    
    if (!sanitizedName.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      setEmailError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!passwordValid) {
      setError('Please ensure your password meets all requirements');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(sanitizedEmail, password, sanitizedName);
      
      if (error) {
        // Generic error messages to prevent information disclosure
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('password')) {
          setError('Password does not meet security requirements. Please try a different password.');
        } else {
          setError('Unable to create account. Please try again later.');
        }
      } else {
        toast({
          title: "Check your email!",
          description: "We sent you a confirmation link to verify your account. Your cards will be saved automatically when you sign in.",
        });
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again later.');
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailError('');

    // Rate limiting check
    const userKey = `signin_${email}`;
    if (!authRateLimiter.isAllowed(userKey)) {
      const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(userKey) / 1000 / 60);
      setError(`Too many attempts. Please try again in ${remainingTime} minutes.`);
      setRateLimited(true);
      setLoading(false);
      return;
    }

    // Validate inputs
    const sanitizedEmail = sanitizeInput(email);
    
    if (!validateEmail(sanitizedEmail)) {
      setEmailError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(sanitizedEmail, password);
      
      if (error) {
        // Generic error messages to prevent information disclosure
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate('/');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again later.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Kindred Cards</CardTitle>
          <CardDescription>
            Create your account or sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                      setRateLimited(false);
                    }}
                    required
                    className={emailError ? 'border-red-500' : ''}
                  />
                  {emailError && (
                    <p className="text-sm text-red-600">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    required
                    className={emailError ? 'border-red-500' : ''}
                  />
                  {emailError && (
                    <p className="text-sm text-red-600">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className={!passwordValid && password ? 'border-red-500' : ''}
                  />
                  <PasswordStrengthIndicator 
                    password={password} 
                    onValidationChange={setPasswordValid}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}