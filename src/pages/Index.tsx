import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Heart, Users, Image, ArrowRight, Brain, BookOpen, Smile, Target, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Organic background shapes inspired by Art Center */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-art-pink rounded-full mix-blend-multiply filter blur-xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-art-yellow rounded-full mix-blend-multiply filter blur-xl opacity-70 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-art-green rounded-full mix-blend-multiply filter blur-xl opacity-70 translate-y-1/3"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-art-blue rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-art-orange rounded-full mix-blend-multiply filter blur-xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Top banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium relative z-10">
        Now available: Create custom family learning cards!
      </div>

      {/* Navigation - Art Center style */}
      <nav className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-art-pink" />
                <span className="text-xl font-bold text-foreground tracking-tight">FamilyCards</span>
              </div>
              <div className="hidden md:flex space-x-6 text-sm font-medium uppercase tracking-wide">
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">About</span>
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">Examples</span>
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">Pricing</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/create')} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 text-sm font-medium uppercase tracking-wide">
                Create Cards
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                0
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Lava lamp blob style */}
      <section className="relative h-screen px-6 lg:px-8 z-10 overflow-hidden">
        {/* Organic lava lamp blob shapes */}
        <div className="absolute inset-0">
          {/* Pink blob - top left */}
          <div className="absolute top-0 left-0 w-[500px] h-[400px] bg-art-pink opacity-90 transform -translate-x-1/4 -translate-y-1/4" style={{
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
          }}></div>
          
          {/* Yellow blob - center large */}
          <div className="absolute top-1/2 left-1/2 w-[700px] h-[600px] bg-art-yellow opacity-95 transform -translate-x-1/2 -translate-y-1/2 rotate-12" style={{
            borderRadius: '40% 60% 70% 30% / 40% 40% 60% 60%'
          }}></div>
          
          {/* Green blob - top right */}
          <div className="absolute top-0 right-0 w-[450px] h-[500px] bg-art-green opacity-90 transform translate-x-1/4 -translate-y-1/6 -rotate-12" style={{
            borderRadius: '70% 30% 30% 70% / 30% 30% 70% 70%'
          }}></div>
          
          {/* Red/Orange blob - bottom left */}
          <div className="absolute bottom-0 left-0 w-[400px] h-[350px] bg-art-red opacity-85 transform -translate-x-1/6 translate-y-1/4 rotate-45" style={{
            borderRadius: '50% 50% 80% 20% / 25% 75% 25% 75%'
          }}></div>
          
          {/* Blue blob - bottom right */}
          <div className="absolute bottom-0 right-0 w-[380px] h-[320px] bg-art-blue opacity-85 transform translate-x-1/5 translate-y-1/6 -rotate-30" style={{
            borderRadius: '80% 20% 40% 60% / 60% 40% 60% 40%'
          }}></div>
          
          {/* Additional small blobs for lava lamp effect */}
          <div className="absolute top-1/4 left-1/3 w-[150px] h-[120px] bg-art-orange opacity-70 transform rotate-45" style={{
            borderRadius: '70% 30% 50% 50% / 30% 30% 70% 70%'
          }}></div>
          
          <div className="absolute bottom-1/3 right-1/3 w-[120px] h-[140px] bg-art-pink opacity-60 transform -rotate-30" style={{
            borderRadius: '40% 60% 60% 40% / 70% 30% 70% 30%'
          }}></div>
        </div>

        {/* Content over blobs - exact Art Center positioning */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-12 leading-tight max-w-4xl">
            Family Cards and
            <br />Learning for Kids
          </h1>
          <Button size="lg" onClick={() => navigate('/create')} className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg font-bold uppercase tracking-widest mb-16">
            Create Now
          </Button>
          <div className="animate-bounce">
            <ArrowRight className="h-6 w-6 text-foreground rotate-90" />
          </div>
        </div>
      </section>

      {/* About section - Art Center style */}
      <section className="relative py-20 bg-background/50 z-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-8 leading-tight">
            We teach the fundamentals of family connection while encouraging creativity, curiosity, and individuality.
          </h2>
          <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-bold uppercase tracking-wide">
            About Us
          </Button>
        </div>
      </section>

      {/* Our Programs - Art Center style */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-6">Our Programs</h2>
            <p className="text-xl text-muted-foreground font-medium max-w-3xl mx-auto">
              We offer custom family cards for all ages throughout the year. If you don't see the perfect option, we'll create one!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-art-yellow p-8 rounded-3xl h-64 flex flex-col justify-between hover:scale-105 transition-transform duration-300">
                <div>
                  <h3 className="text-2xl font-black text-foreground mb-2">Baby Cards</h3>
                  <p className="text-foreground/80 font-medium">First introductions to family</p>
                </div>
                <Button variant="outline" className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-art-yellow w-fit px-6 py-2 font-bold uppercase text-sm tracking-wide">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="group">
              <div className="bg-art-pink p-8 rounded-3xl h-64 flex flex-col justify-between hover:scale-105 transition-transform duration-300">
                <div>
                  <h3 className="text-2xl font-black text-foreground mb-2">Toddler Collection</h3>
                  <p className="text-foreground/80 font-medium">Interactive family learning</p>
                </div>
                <Button variant="outline" className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-art-pink w-fit px-6 py-2 font-bold uppercase text-sm tracking-wide">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="group">
              <div className="bg-art-green p-8 rounded-3xl h-64 flex flex-col justify-between hover:scale-105 transition-transform duration-300">
                <div>
                  <h3 className="text-2xl font-black text-foreground mb-2">Custom Sets</h3>
                  <p className="text-foreground/80 font-medium">Personalized family stories</p>
                </div>
                <Button variant="outline" className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-art-green w-fit px-6 py-2 font-bold uppercase text-sm tracking-wide">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parties & Events section */}
      <section className="relative py-20 bg-art-blue/20 z-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-8">Parties & Events</h2>
          <p className="text-xl text-foreground/80 font-medium mb-8 max-w-2xl mx-auto">
            Make birthdays and celebrations extra special with custom family learning activities
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-bold uppercase tracking-wide">
            Learn More
          </Button>
        </div>
      </section>

      {/* Featured Products - Art Center style */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-6">Family Goodies</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-square bg-art-yellow/20 rounded-2xl mb-4 flex items-center justify-center">
                  <Heart className="h-16 w-16 text-art-pink" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">Family Memory Box</h3>
                <p className="text-lg font-bold text-foreground mb-4">$28.00</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground font-medium">Color</p>
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 bg-art-pink rounded-full border-2 border-foreground"></div>
                    <div className="w-6 h-6 bg-art-yellow rounded-full border border-border"></div>
                    <div className="w-6 h-6 bg-art-blue rounded-full border border-border"></div>
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-sm tracking-wide">
                  Add to Cart
                </Button>
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-square bg-art-green/20 rounded-2xl mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-art-green" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">Kids Family Tee</h3>
                <p className="text-lg font-bold text-foreground mb-4">$20.00</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground font-medium">Size</p>
                  <div className="flex space-x-2">
                    <span className="px-3 py-1 border border-border rounded text-sm font-medium">XS</span>
                    <span className="px-3 py-1 border border-border rounded text-sm font-medium">S</span>
                    <span className="px-3 py-1 border border-border rounded text-sm font-medium">M</span>
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-sm tracking-wide">
                  Add to Cart
                </Button>
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-square bg-art-orange/20 rounded-2xl mb-4 flex items-center justify-center">
                  <Image className="h-16 w-16 text-art-orange" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">Custom Photo Cards</h3>
                <p className="text-lg font-bold text-foreground mb-4">$26.00</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground font-medium">Set Size</p>
                  <div className="flex space-x-2">
                    <span className="px-3 py-1 border border-border rounded text-sm font-medium">10</span>
                    <span className="px-3 py-1 border border-border rounded text-sm font-medium">20</span>
                    <span className="px-3 py-1 border border-border rounded text-sm font-medium">30</span>
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-sm tracking-wide">
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-background border-t border-border py-16 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-art-pink" />
              <span className="text-2xl font-black text-foreground tracking-tight">FamilyCards</span>
            </div>
            <p className="text-muted-foreground font-medium text-lg">
              Creating memories, one card at a time
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;