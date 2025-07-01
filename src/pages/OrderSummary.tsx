
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Users } from "lucide-react";
import { FamilyCard } from "@/pages/CreateCards";
import { CardPreview } from "@/components/CardPreview";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cards, clearCart } = useCart();
  
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    specialInstructions: '',
  });

  const pricePerCard = 2.99;
  const shippingCost = 5.99;
  const totalCardCost = cards.length * pricePerCard;
  const totalCost = totalCardCost + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Order Submitted!",
      description: `Your order for ${cards.length} cards has been submitted. You'll receive an email confirmation shortly.`,
    });
    // Here you would integrate with a payment processor like Stripe
    console.log('Order details:', { orderDetails, cards, totalCost });
    
    // Clear cart after successful order
    clearCart();
    
    // Redirect to home page after a delay
    setTimeout(() => {
      navigate('/');
    }, 2000);
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
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="text-2xl font-bold text-gray-800">FamilyCards</span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/create')}>
              Back to Create
            </Button>
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
                        <p className="text-sm text-gray-600 capitalize">{card.relationship}</p>
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
