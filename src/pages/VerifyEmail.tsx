import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDraft } from '@/hooks/useDraft';
import { useSupabaseCards } from '@/hooks/useSupabaseCards';
import { useAuth } from '@/hooks/useAuth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDraft, clearDraft } = useDraft();
  const { addCard } = useSupabaseCards();
  const { user } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [migratingCards, setMigratingCards] = useState(false);
  const [migratedCount, setMigratedCount] = useState(0);

  useEffect(() => {
    const handleEmailVerification = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || type !== 'signup') {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link');
        return;
      }

      try {
        // Verify the email token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('❌ Email verification error:', error);
          setVerificationStatus('error');
          setErrorMessage(error.message || 'Verification failed');
          return;
        }

        if (data.user) {
          console.log('✅ Email verified successfully for user:', data.user.id);
          setVerificationStatus('success');
          
          // Check if user had draft cards to migrate
          const draftCards = getDraft();
          if (draftCards && draftCards.length > 0) {
            await migrateDraftCards(draftCards);
          }

          toast({
            title: "Email Verified!",
            description: "Your account has been activated successfully.",
          });
        }
      } catch (error: any) {
        console.error('❌ Verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(error.message || 'An unexpected error occurred');
      }
    };

    handleEmailVerification();
  }, [searchParams]);

  const migrateDraftCards = async (draftCards: any[]) => {
    setMigratingCards(true);
    let migratedCount = 0;

    try {
      console.log('🔄 Migrating draft cards:', draftCards.length);
      
      for (const card of draftCards) {
        try {
          // Remove the id to let the database generate a new one
          const { id, ...cardData } = card;
          await addCard(cardData);
          migratedCount++;
          setMigratedCount(migratedCount);
        } catch (error) {
          console.error('❌ Failed to migrate card:', error);
        }
      }

      // Clear draft after successful migration
      clearDraft();
      
      toast({
        title: "Cards Saved!",
        description: `Successfully saved ${migratedCount} card${migratedCount !== 1 ? 's' : ''} to your account.`,
      });

    } catch (error: any) {
      console.error('❌ Card migration error:', error);
      toast({
        title: "Migration Error",
        description: "Some cards couldn't be saved. Please try creating them again.",
        variant: "destructive"
      });
    } finally {
      setMigratingCards(false);
    }
  };

  const handleContinue = () => {
    navigate('/create-cards');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-art-pink rounded-full filter blur-xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-art-blue rounded-full filter blur-xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
      </div>

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-2 border-border/20 rounded-3xl shadow-lg relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">
            Email Verification
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {verificationStatus === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 text-art-pink animate-spin mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Verifying your email...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we activate your account
                </p>
              </div>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg text-green-700">Verification Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your account has been activated
                </p>
              </div>

              {migratingCards && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Saving your cards...</span>
                  </div>
                  {migratedCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Saved {migratedCount} card{migratedCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-art-pink hover:bg-art-pink/90 text-white"
                  disabled={migratingCards}
                >
                  <span>Continue to Your Cards</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full"
                  disabled={migratingCards}
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg text-red-700">Verification Failed</h3>
                <p className="text-sm text-muted-foreground">
                  {errorMessage}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleGoHome}
                  className="w-full"
                >
                  Go to Homepage
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  If you continue to have issues, please contact support or try signing up again.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;