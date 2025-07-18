import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [emailSent, setEmailSent] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const sendOrderEmail = async () => {
      if (!sessionId || emailSent) return;

      try {
        // Retrieve order data from database using session ID
        const { data, error } = await supabase.functions.invoke('send-order-email', {
          body: {
            sessionId,
          },
        });

        if (error) {
          console.error('Error sending order email:', error);
        } else {
          console.log('Order email sent successfully:', data);
          setEmailSent(true);
        }
      } catch (error) {
        console.error('Error sending order email:', error);
      }
    };

    sendOrderEmail();
  }, [sessionId, emailSent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/5128289b-d7c7-4d2c-9975-2651dcb38ae0.png" 
                alt="Kindred Cards" 
                className="h-12 w-32 object-cover object-center cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => navigate('/')}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Success Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your order. Your cards are now being prepared.
          </p>
        </div>

        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-center text-green-800">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Order Confirmation</h3>
                <p className="text-gray-600">You'll receive an email confirmation shortly with your order details.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Card Production</h3>
                <p className="text-gray-600">Your custom cards will be professionally printed and prepared for shipping.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Shipping</h3>
                <p className="text-gray-600">Your cards will be shipped to the address you provided. Expect delivery in 5-7 business days.</p>
              </div>
            </div>

            {sessionId && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Order Reference:</strong> {sessionId.slice(-12)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8 space-y-4">
          <Button 
            onClick={() => navigate('/create')}
            className="bg-pink-500 hover:bg-pink-600"
          >
            Create More Cards
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;