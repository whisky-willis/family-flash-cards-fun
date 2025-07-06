import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { validatePassword } from '@/lib/security';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[]; score: number }>({ 
    isValid: false, 
    errors: [], 
    score: 0 
  });
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    if (newPassword) {
      const validation = validatePassword(newPassword);
      const score = Math.min(100, (5 - validation.errors.length) * 20);
      setPasswordStrength({ 
        ...validation, 
        score: Math.max(0, score) 
      });
    } else {
      setPasswordStrength({ isValid: false, errors: [], score: 0 });
    }
  };

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
    
    if (!name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!passwordStrength.isValid && password) {
      setError('Please fix the password requirements below');
      setLoading(false);
      return;
    }

    const { data, error } = await signUp(email, password, name);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(error.message);
      }
    } else {
      toast({
        title: "Check your email!",
        description: "We sent you a confirmation link to verify your account. Your cards will be saved automatically when you sign in.",
      });
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      setPasswordStrength({ isValid: false, errors: [], score: 0 });
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message);
      }
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate('/');
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="signup-password">Password</Label>
                   <div className="relative">
                     <Input
                       id="signup-password"
                       type={showPassword ? "text" : "password"}
                       value={password}
                       onChange={(e) => handlePasswordChange(e.target.value)}
                       required
                       minLength={8}
                       className="pr-10"
                     />
                     <Button
                       type="button"
                       variant="ghost"
                       size="sm"
                       className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                       onClick={() => setShowPassword(!showPassword)}
                     >
                       {showPassword ? (
                         <EyeOff className="h-4 w-4" />
                       ) : (
                         <Eye className="h-4 w-4" />
                       )}
                     </Button>
                   </div>
                   {password && (
                     <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={passwordStrength.score} 
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground">
                            {passwordStrength.score < 40 ? 'Weak' : 
                             passwordStrength.score < 80 ? 'Good' : 'Strong'}
                          </span>
                        </div>
                       {passwordStrength.errors.length > 0 && (
                         <div className="text-xs text-muted-foreground space-y-1">
                           {passwordStrength.errors.map((error, index) => (
                             <div key={index} className="flex items-center space-x-1">
                               <span className="text-red-500">•</span>
                               <span>{error}</span>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   )}
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