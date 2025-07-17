import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, ArrowRight } from "lucide-react";

const PaymentCancel = () => {
  const navigate = useNavigate();

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

      {/* Cancel Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-gray-600">
            Your payment was cancelled. No charges have been made.
          </p>
        </div>

        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="text-center text-orange-800">What would you like to do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Don't worry! Your card designs are still saved. You can complete your purchase anytime.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try Payment Again
                </Button>
                
                <Button 
                  onClick={() => navigate('/create')}
                  className="bg-pink-500 hover:bg-pink-600 flex items-center"
                >
                  Continue Editing Cards
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Need help?</h3>
              <p className="text-sm text-gray-600">
                If you experienced any issues during checkout, please contact our support team and we'll be happy to assist you.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;