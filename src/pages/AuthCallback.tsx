import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDraft } from '@/hooks/useDraft';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDraft, clearDraft } = useDraft();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Processing auth callback...');
        
        // Let Supabase handle the session from URL fragments
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Authentication failed');
          return;
        }

        if (session?.user) {
          console.log('✅ User authenticated:', session.user.id);
          
          // Check if this is a save_for_later signup
          if (session.user.user_metadata?.signup_type === 'save_for_later') {
            console.log('🔄 Processing save_for_later signup');
            
            // Get draft cards
            const draftCards = getDraft();
            
            if (draftCards && draftCards.length > 0) {
              console.log('📋 Found draft cards to migrate:', draftCards.length);
              
                             try {
                 // Save all draft cards as a single collection
                 const cardsData = draftCards.map(card => {
                   const { id, ...cardData } = card;
                   return cardData;
                 });
                 
                 const { error: insertError } = await supabase
                   .from('card_collections')
                   .insert({
                     user_id: session.user.id,
                     cards: cardsData,
                     created_at: new Date().toISOString()
                   });
                   
                 if (insertError) {
                   console.error('❌ Error saving cards:', insertError);
                   throw insertError;
                 }
                
                // Clear draft cards after migration
                clearDraft();
                
                // Clear the signup_type to prevent re-migration
                await supabase.auth.updateUser({
                  data: { signup_type: null }
                });
                
                setStatus('success');
                
                // Show success message and redirect
                setTimeout(() => {
                  toast({
                    title: "Welcome! Cards Saved Successfully",
                    description: `Your ${draftCards.length} card${draftCards.length !== 1 ? 's have' : ' has'} been saved to your account.`,
                  });
                  navigate('/create-cards');
                }, 1500);
                
              } catch (error: any) {
                console.error('❌ Draft migration error:', error);
                setStatus('success'); // Still show success for auth, but mention card issue
                
                setTimeout(() => {
                  toast({
                    title: "Account Verified",
                    description: "Your account is ready, but there was an issue saving your draft cards. Please recreate them.",
                    variant: "destructive"
                  });
                  navigate('/create-cards');
                }, 1500);
              }
            } else {
              // No draft cards, just welcome user
              setStatus('success');
              
              // Clear the signup_type
              await supabase.auth.updateUser({
                data: { signup_type: null }
              });
              
              setTimeout(() => {
                toast({
                  title: "Welcome!",
                  description: "Your account has been verified. You can now start creating cards.",
                });
                navigate('/create-cards');
              }, 1500);
            }
          } else {
            // Regular auth callback, redirect to create-cards
            setStatus('success');
            setTimeout(() => {
              navigate('/create-cards');
            }, 1000);
          }
        } else {
          // No session found
          setStatus('error');
          setErrorMessage('No valid session found');
        }
        
      } catch (error: any) {
        console.error('❌ Auth callback processing error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'An unexpected error occurred');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, getDraft, clearDraft]);

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
            {status === 'processing' && 'Verifying Account'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          {status === 'processing' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-art-pink animate-spin mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Processing verification...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we set up your account
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg text-green-700">Account Verified!</h3>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to your cards...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg text-red-700">Verification Failed</h3>
                <p className="text-sm text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
              
              <button
                onClick={handleGoHome}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go to Homepage
              </button>
              
              <p className="text-xs text-muted-foreground">
                If you continue to have issues, please contact support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;