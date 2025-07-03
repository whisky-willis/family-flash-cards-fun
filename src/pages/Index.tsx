import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Heart, Users, Image, ArrowRight, Brain, BookOpen, Smile, Target, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CardPreview } from "@/components/CardPreview";
import kindredLogo from "@/assets/kindred-cards-logo.png";
const Index = () => {
  const navigate = useNavigate();
  const names = ['George', 'Baileigh', 'Nick', 'Sarah'];
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  useEffect(() => {
    const currentName = names[currentNameIndex];
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);
    const typeInterval = setInterval(() => {
      if (charIndex <= currentName.length) {
        setDisplayedText(currentName.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setCurrentNameIndex(prevIndex => (prevIndex + 1) % names.length);
        }, 2000);
      }
    }, 100);
    return () => clearInterval(typeInterval);
  }, [currentNameIndex]);
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
              <div className="flex items-center space-x-3">
                <img src="/lovable-uploads/04092500-527b-498c-a609-7be0f47bef86.png" alt="Kindred Cards" className="h-14 w-14" />
                <span className="text-xl font-bold text-foreground tracking-tight">Kindred Cards</span>
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

      {/* Hero Section - Exact Art Center style with organic blobs */}
      <section className="relative h-screen px-6 lg:px-8 z-10 overflow-hidden">
        {/* Large organic blob shapes - exact Art Center style */}
        <div className="absolute inset-0">
          {/* Pink blob - top left */}
          <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-art-pink opacity-90" style={{
          clipPath: 'polygon(20% 0%, 80% 10%, 100% 50%, 85% 90%, 30% 100%, 0% 70%, 5% 30%)'
        }}></div>
          
          {/* Yellow blob - center large */}
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[700px] bg-art-yellow opacity-95 transform -translate-x-1/2 -translate-y-1/2" style={{
          clipPath: 'polygon(25% 0%, 75% 5%, 95% 35%, 90% 70%, 70% 95%, 25% 90%, 5% 60%, 10% 25%)'
        }}></div>
          
          {/* Green blob - top right */}
          <div className="absolute top-0 right-0 w-[550px] h-[600px] bg-art-green opacity-90" style={{
          clipPath: 'polygon(15% 0%, 85% 0%, 100% 40%, 95% 80%, 60% 100%, 20% 85%, 0% 50%, 10% 20%)'
        }}></div>
          
          {/* Red/Orange blob - bottom left */}
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-art-red opacity-85" style={{
          clipPath: 'polygon(30% 0%, 80% 15%, 100% 60%, 75% 100%, 0% 100%, 0% 40%, 15% 10%)'
        }}></div>
          
          {/* Blue blob - bottom right */}
          <div className="absolute bottom-0 right-0 w-[450px] h-[350px] bg-art-blue opacity-85" style={{
          clipPath: 'polygon(40% 0%, 100% 0%, 100% 70%, 80% 100%, 20% 90%, 10% 50%, 25% 15%)'
        }}></div>
        </div>

        {/* Content over blobs - exact Art Center positioning */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-12 leading-tight max-w-4xl">
            Help <span className="relative">
              {displayedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </span> Learn
            <br />About Family and Friends
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
          <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight">Turn Screen Time Into Story Time</h2>
          <h4 className="text-xl lg:text-2xl font-medium text-foreground/80 mb-8 leading-relaxed">Create meaningful family conversations through personalized learning cards that bring everyone together.</h4>
          
        </div>
      </section>

      {/* How It Works section */}
      <section className="relative py-20 z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-6">How It Works</h2>
            <p className="text-xl text-foreground/80 font-medium max-w-2xl mx-auto">
              Create magical moments where family stories come alive through play
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-art-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-black text-foreground">1</span>
              </div>
              <h3 className="text-xl font-black text-foreground mb-3">Upload Photos</h3>
              <p className="text-foreground/80 font-medium leading-relaxed">
                Select photos of family members, friends, and loved ones who matter most
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-art-pink rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-black text-foreground">2</span>
              </div>
              <h3 className="text-xl font-black text-foreground mb-3">Customize Cards</h3>
              <p className="text-foreground/80 font-medium leading-relaxed">
                Add names, relationships, fun facts, and conversation starters for each person
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-art-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-black text-foreground">3</span>
              </div>
              <h3 className="text-xl font-black text-foreground mb-3">Start Learning</h3>
              <p className="text-foreground/80 font-medium leading-relaxed">
                Experience the joy of watching your child learn about the people they love
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Card Examples - Art Center style */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-6">See Example Family Cards</h2>
            <p className="text-xl text-foreground/80 font-medium max-w-2xl mx-auto">
              Discover how our cards help children learn about the special people in their lives
            </p>
          </div>

          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <CardPreview 
                    card={{
                      name: "Uncle Mike",
                      relationship: "uncle",
                      dateOfBirth: "1985-03-15",
                      favoriteColor: "green",
                      hobbies: "Guitar, Hiking",
                      funFact: "Can play 5 different instruments and once climbed Mount Washington!"
                    }}
                  />
                </div>
              </CarouselItem>

              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <CardPreview 
                    card={{
                      name: "Grandma Rose",
                      relationship: "grandmother",
                      dateOfBirth: "1952-09-22",
                      favoriteColor: "purple",
                      hobbies: "Gardening, Baking",
                      funFact: "Has traveled to 23 countries and speaks 4 languages fluently"
                    }}
                  />
                </div>
              </CarouselItem>

              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <CardPreview 
                    card={{
                      name: "Cousin Alex",
                      relationship: "cousin",
                      dateOfBirth: "2010-07-08",
                      favoriteColor: "orange",
                      hobbies: "Soccer, Video Games",
                      funFact: "Scored the winning goal in the championship game last year"
                    }}
                  />
                </div>
              </CarouselItem>

              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <CardPreview 
                    card={{
                      name: "Aunt Sarah",
                      relationship: "aunt",
                      dateOfBirth: "1978-12-03",
                      favoriteColor: "pink",
                      hobbies: "Photography, Yoga",
                      funFact: "Takes amazing nature photos and teaches yoga to kids on weekends"
                    }}
                  />
                </div>
              </CarouselItem>

              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <CardPreview 
                    card={{
                      name: "Uncle Tom",
                      relationship: "uncle",
                      dateOfBirth: "1980-06-18",
                      favoriteColor: "blue",
                      hobbies: "Cooking, Fishing",
                      funFact: "Makes the world's best pancakes and caught a 20-pound fish last summer"
                    }}
                  />
                </div>
              </CarouselItem>

              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <CardPreview 
                    card={{
                      name: "Big Sister Emma",
                      relationship: "sister",
                      dateOfBirth: "2005-11-14",
                      favoriteColor: "yellow",
                      hobbies: "Dancing, Reading",
                      funFact: "Won first place in the school talent show with her amazing dance routine"
                    }}
                  />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
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
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img src={kindredLogo} alt="Kindred Cards" className="h-8 w-8" />
              <span className="text-2xl font-black text-foreground tracking-tight">Kindred Cards</span>
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