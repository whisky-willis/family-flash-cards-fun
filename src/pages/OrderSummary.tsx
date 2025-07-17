
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Users } from "lucide-react";
import { FamilyCard } from "@/pages/CreateCards";
import { CardPreview } from "@/components/CardPreview";
import { useToast } from "@/hooks/use-toast";
const kindredLogo = "/lovable-uploads/b059ee5b-3853-4004-9b40-6da60dbfe02f.png";

const OrderSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const cards = location.state?.cards as FamilyCard[] || [];
  
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    specialInstructions: '',
  });

  const pricePerCard = 3.99;
  const shippingCost = 5.99;
  const totalCardCost = cards.length * pricePerCard;
  const totalCost = totalCardCost + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!orderDetails.name || !orderDetails.email || !orderDetails.address || 
        !orderDetails.city || !orderDetails.postalCode || !orderDetails.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { cards, orderDetails }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Cards Found</h1>
          <p className="text-gray-600 mb-4">Please create some cards first.</p>
          <Button onClick={() => navigate('/create')}>Create Cards</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Navigation - matches site-wide style */}
      <nav className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:justify-between">
            <div className="flex items-center space-x-8 flex-1 md:flex-initial">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/5128289b-d7c7-4d2c-9975-2651dcb38ae0.png" 
                  alt="Kindred Cards" 
                  className="h-12 w-32 object-cover object-center cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => navigate('/')}
                />
              </div>
              <div className="hidden md:flex space-x-6 text-sm font-medium uppercase tracking-wide">
                <span className="text-foreground/70 hover:text-foreground cursor-pointer" onClick={() => navigate('/about')}>About</span>
                <span className="text-foreground/70 hover:text-foreground cursor-pointer" onClick={() => navigate('/')}>Examples</span>
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">Pricing</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button onClick={() => navigate('/create')} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                Back to Create
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                {cards.length}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Summary
          </h1>
          <p className="text-xl text-gray-600">
            Review your cards and complete your order
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div>
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={orderDetails.name}
                        onChange={(e) => setOrderDetails({ ...orderDetails, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={orderDetails.email}
                        onChange={(e) => setOrderDetails({ ...orderDetails, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={orderDetails.address}
                      onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={orderDetails.city}
                        onChange={(e) => setOrderDetails({ ...orderDetails, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={orderDetails.postalCode}
                        onChange={(e) => setOrderDetails({ ...orderDetails, postalCode: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={orderDetails.country}
                        onChange={(e) => setOrderDetails({ ...orderDetails, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      value={orderDetails.specialInstructions}
                      onChange={(e) => setOrderDetails({ ...orderDetails, specialInstructions: e.target.value })}
                      placeholder="Any special requests or notes for your order"
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span>Cards ({cards.length} × ${pricePerCard.toFixed(2)}):</span>
                      <span>${totalCardCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Shipping:</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-pink-500 hover:bg-pink-600 text-lg py-3"
                  >
                    Place Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Review */}
          <div>
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle>Your Cards ({cards.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {cards.map((card) => (
                    <div key={card.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      {card.photo ? (
                        <img 
                          src={card.photo} 
                          alt={card.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{card.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{card.whereTheyLive}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        ${pricePerCard.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
